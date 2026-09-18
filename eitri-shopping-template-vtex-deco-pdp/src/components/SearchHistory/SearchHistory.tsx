import { useEffect, useState } from 'react'
import { Text, View } from 'eitri-luminus'
import { deleteHistory, getSearchHistory } from '../../services/SearchMetadataService'
import { ClockIcon } from 'eitri-shopping-template-vtex-deco-shared'
import { useTranslation } from 'eitri-i18n'

interface SearchHistoryProps {
	onSubmit: (term: string) => void
	className?: string
	[key: string]: unknown
}

export default function SearchHistory(props: SearchHistoryProps) {
	const { onSubmit, className, ...rest } = props
	const { t } = useTranslation()

	const [history, setHistory] = useState<string[]>([])

	useEffect(() => {
		getSearchHistory()
			.then(res => setHistory(res))
			.catch(() => {})
	}, [])

	const clearHistory = () => {
		setHistory([])
		deleteHistory()
	}

	if (!history?.length) return null

	return (
		<View
			className={`${className || ''}`}
			{...rest}>
			<View className={'flex justify-between items-center'}>
				<Text className='font-bold text-sm'>{t('searchHistory.title')}</Text>
				<View
					onClick={clearHistory}
					className={'text-sm text-gray-600'}>
					<Text>{t('searchHistory.clear')}</Text>
				</View>
			</View>
			<View className='mt-4 flex flex-col gap-3'>
				{history.map(term => (
					<View
						key={term}
						className='flex items-center justify-between'
						onClick={() => onSubmit(term)}>
						<View className='flex items-center gap-2'>
							<ClockIcon
								className={'text-primary'}
								size={20}
							/>
							<Text className='text'>{term}</Text>
						</View>
					</View>
				))}
			</View>
		</View>
	)
}
