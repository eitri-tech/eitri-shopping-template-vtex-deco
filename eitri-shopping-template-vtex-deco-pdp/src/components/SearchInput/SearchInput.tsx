import { useEffect, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { Text, View, TextInput } from 'eitri-luminus'
import { useTranslation } from 'eitri-i18n'
import { Vtex } from 'eitri-shopping-vtex-shared'
import { autocompleteSuggestions } from '../../services/productService'
import Eitri from 'eitri-bifrost'
import { SearchIcon, ChevronLeftIcon } from 'eitri-shopping-template-vtex-deco-shared'
import QRCodeScanner from '../QRCodeScanner/QRCodeScanner'
import TopSearches from '../TopSearches/TopSearches'
import SearchHistory from '../SearchHistory/SearchHistory'

let timeoutId: ReturnType<typeof setTimeout> | undefined
let skipSuggestion = false

interface SearchInputProps {
	onSubmit?: (term?: string) => void
	incomingValue?: string
	autoFocus?: boolean
	onClickInput?: () => void
	alwaysShowBackButton?: boolean
}

interface SearchSuggestionEntry {
	term?: string
	[key: string]: unknown
}

export default function SearchInput(props: SearchInputProps) {
	const { onSubmit, incomingValue, autoFocus, onClickInput, alwaysShowBackButton } = props
	const { t } = useTranslation()

	const [searchTerm, setSearchTerm] = useState(incomingValue || '')
	const [searchSuggestion, setSearchSuggestion] = useState<SearchSuggestionEntry[]>([])
	const [isFocused, setIsFocused] = useState(false)
	const [showSearchInsights, setShowSearchInsights] = useState(false)

	const legacySearch = (Vtex?.configs as any)?.searchOptions?.legacySearch

	useEffect(() => {
		if (incomingValue) {
			setSearchTerm(incomingValue)
		}
	}, [incomingValue])

	useEffect(() => {
		if (showSearchInsights) {
			Eitri.navigation.addBackHandler(() => {
				setShowSearchInsights(false)
				return false
			})
		} else {
			Eitri.navigation.clearBackHandlers()
		}
	}, [showSearchInsights])

	useEffect(() => {
		setShowSearchInsights(isFocused)
	}, [isFocused])

	const debounce = (func: (...args: any[]) => void, delay: number) => {
		return function (this: unknown, ...args: any[]) {
			clearTimeout(timeoutId)
			timeoutId = setTimeout(() => func.apply(this, args), delay)
		}
	}

	const fetchSuggestions = async (value: string) => {
		try {
			if (!value) {
				setSearchSuggestion([])
				return
			}
			const result = (await autocompleteSuggestions(value)) as { searches?: SearchSuggestionEntry[] } | undefined
			if (skipSuggestion) {
				setSearchSuggestion([])
				return
			}
			setSearchSuggestion(result?.searches ?? [])
		} catch (error) {
			console.log('Entrada de pesquisa', 'Erro ao buscar sugestão', error)
		}
	}

	const handleAutocomplete = async (value: string) => {
		setSearchTerm(value)

		if (legacySearch) return

		const debouncedFetchSuggestions = debounce(fetchSuggestions, 400)
		debouncedFetchSuggestions(value)
	}

	const handleSearch = (suggestion?: string) => {
		if (timeoutId) clearTimeout(timeoutId)
		setSearchSuggestion([])
		if (typeof onSubmit === 'function') onSubmit(suggestion)
		skipSuggestion = true
	}

	const onBlurHandler = () => {
		setTimeout(() => {
			if (timeoutId) clearTimeout(timeoutId)
			setSearchSuggestion([])
			skipSuggestion = true
			setIsFocused(false)
		}, 200)
	}

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		console.log('change')
		const value = e.target.value
		skipSuggestion = false
		handleAutocomplete(value)
	}

	const handleOnKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
		console.log('handleOnKeyPress', e.key)
		if (e.key === 'Enter') {
			handleSearch(searchTerm)
		}
	}

	const _onClickInput = () => {
		if (onClickInput) onClickInput()
	}

	const onBackPress = () => {
		if (searchTerm) {
			setSearchTerm('')
			setShowSearchInsights(false)
		} else if (showSearchInsights) {
			setShowSearchInsights(false)
		} else {
			Eitri.navigation.back(1)
		}
	}

	return (
		<View className={'flex items-center justify-between w-full gap-4 relative'}>
			{(searchTerm || alwaysShowBackButton) && (
				<View onClick={onBackPress}>
					<ChevronLeftIcon className='text-primary-content' />
				</View>
			)}

			<View
				className='flex items-center justify-between rounded-lg h-10 px-4 bg-neutral-100 grow'
				onClick={_onClickInput}>
				{/* TextInput's real implementation wires up handleKeyUp internally but has no
				handleKeyPress at all — onKeyPress (though type-inherited from InputHTMLAttributes)
				was silently never firing, so Enter-to-search never worked. onKeyUp does fire. */}
				<TextInput
					autoFocus={autoFocus}
					value={searchTerm}
					onChange={handleInputChange}
					onKeyUp={handleOnKeyPress}
					onBlur={onBlurHandler}
					onFocus={() => setIsFocused(true)}
					enterKeyHint='done'
					placeholder={t('searchInput.placeholder')}
					className='rounded-lg !outline-none !ring-0 focus:!outline-none focus:!ring-0 focus-within:!outline-none focus-within:!ring-0 !bg-transparent border-none shadow-none w-full px-2'
				/>

				<SearchIcon className='text-primary' />
			</View>

			{/* <QRCodeScanner /> */}

			{showSearchInsights && !searchTerm && (
				<View className='absolute top-[45px] left-0 w-full bg-white rounded-lg max-h-[70vh] overflow-y-auto'>
					<View className='w-full shadow flex flex-col gap-4 p-4'>
						<SearchHistory onSubmit={handleSearch} />
						<TopSearches onSubmit={handleSearch} />
					</View>
				</View>
			)}

			{searchSuggestion && searchSuggestion.length > 0 && (
				<View className='absolute top-[45px] left-0 w-full bg-white rounded-lg max-h-[70vh] overflow-y-auto'>
					<View className='w-full shadow flex flex-col gap-4 p-4'>
						{searchSuggestion.map((suggestion, key) => (
							<View
								onClick={() => handleSearch(suggestion.term)}
								key={suggestion.term ?? key}>
								<Text className=''>{suggestion.term}</Text>
							</View>
						))}
					</View>
				</View>
			)}
		</View>
	)
}
