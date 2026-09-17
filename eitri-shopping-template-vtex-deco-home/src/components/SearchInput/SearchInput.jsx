import { Text, View } from 'eitri-luminus'
import { Vtex } from 'eitri-shopping-vtex-shared'
import { autocompleteSuggestions } from '../../services/ProductService'
import Eitri from 'eitri-bifrost'
import { FiSearch, FiChevronLeft, FiX } from 'react-icons/fi'
import { useTranslation } from 'eitri-i18n'
import QRCodeScanner from '../QRCodeScanner/QRCodeScanner'
import TopSearches from '../TopSearches/TopSearches'
import SearchHistory from '../SearchHistory/SearchHistory'

let timeoutId
let skipSuggestion = false

export default function SearchInput(props) {
	const { onSubmit, incomingValue, autoFocus, onClickInput, alwaysShowBackButton } = props
	const { t } = useTranslation()

	const [searchTerm, setSearchTerm] = useState(incomingValue || '')
	const [searchSuggestion, setSearchSuggestion] = useState([])
	const [isFocused, setIsFocused] = useState(false)
	const [showSearchInsights, setShowSearchInsights] = useState(false)

	const legacySearch = Vtex?.configs?.searchOptions?.legacySearch

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

	const debounce = (func, delay) => {
		return function (...args) {
			clearTimeout(timeoutId)
			timeoutId = setTimeout(() => func.apply(this, args), delay)
		}
	}

	const fetchSuggestions = async value => {
		try {
			if (!value) {
				setSearchSuggestion([])
				return
			}
			const result = await autocompleteSuggestions(value)
			if (skipSuggestion) {
				setSearchSuggestion([])
				return
			}
			setSearchSuggestion(result?.searches)
		} catch (error) {
			console.log('Entrada de pesquisa', 'Erro ao buscar sugestão', error)
		}
	}

	const handleAutocomplete = async value => {
		setSearchTerm(value)

		if (legacySearch) {
			return
		}

		const debouncedFetchSuggestions = debounce(fetchSuggestions, 400)
		debouncedFetchSuggestions(value)
	}

	const handleSearch = suggestion => {
		if (timeoutId) {
			clearTimeout(timeoutId)
		}
		setSearchSuggestion([])
		if (typeof onSubmit === 'function') onSubmit(suggestion)
		skipSuggestion = true
	}

	const onBlurHandler = () => {
		setTimeout(() => {
			if (timeoutId) {
				clearTimeout(timeoutId)
			}
			setSearchSuggestion([])
			skipSuggestion = true
			setIsFocused(false)
		}, 200)
	}

	const handleInputChange = e => {
		const value = e.target.value
		skipSuggestion = false
		handleAutocomplete(value)
	}

	const handleOnKeyPress = e => {
		if (e.key === 'Enter') {
			handleSearch(searchTerm)
		}
	}

	const _onClickInput = () => {
		if (onClickInput) {
			onClickInput()
		}
	}

	const onBackPress = () => {
		Eitri.navigation.back()
	}

	const handleClear = () => {
		skipSuggestion = false
		handleAutocomplete('')
	}

	return (
		<View className={'flex items-center justify-between w-full relative'}>
			{(searchTerm || alwaysShowBackButton) && (
				<View
					onClick={onBackPress}
					className='mr-2'>
					<FiChevronLeft
						className='text-header-content'
						size={24}
					/>
				</View>
			)}

			<View
				className='flex items-center justify-between rounded-lg h-10 px-4 bg-neutral-100 grow'
				onClick={_onClickInput}>
				<TextInput
					autoFocus={autoFocus}
					type={'text'}
					value={searchTerm}
					onChange={handleInputChange}
					onKeyPress={handleOnKeyPress}
					onBlur={onBlurHandler}
					onFocus={() => setIsFocused(true)}
					placeholder={t('searchInput.content')}
					className='rounded-lg !outline-none !ring-0 focus:!outline-none focus:!ring-0 focus-within:!outline-none focus-within:!ring-0 !bg-transparent border-none shadow-none w-full px-2'
				/>

				<View onClick={searchTerm ? handleClear : undefined}>
					{searchTerm ? (
						<FiX
							size={24}
							className='text-primary'
						/>
					) : (
						<FiSearch
							size={24}
							className='text-primary'
						/>
					)}
				</View>
			</View>

			<QRCodeScanner />

			{showSearchInsights && !searchTerm && (
				<View className='absolute top-[45px] left-0 w-full bg-white rounded-lg max-h-[70vh] overflow-y-auto'>
					<View className=' w-full shadow flex flex-col gap-4 p-4'>
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
								key={suggestion.term}>
								<Text className=''>{suggestion.term}</Text>
							</View>
						))}
					</View>
				</View>
			)}
		</View>
	)
}
