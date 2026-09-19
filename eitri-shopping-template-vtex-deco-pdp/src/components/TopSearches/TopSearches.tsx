import { useEffect, useState } from 'react'
import { Text, View } from 'eitri-luminus'
import { getTopSearches } from '../../services/SearchMetadataService'
import { useTranslation } from 'eitri-i18n'

interface TopSearch {
	term?: string
	[key: string]: unknown
}

interface TopSearchesProps {
	onSubmit: (term?: string) => void
	className?: string
	[key: string]: unknown
}

export default function TopSearches(props: TopSearchesProps) {
	const { onSubmit, className, ...rest } = props
	const { t } = useTranslation()

	const [searches, setSearches] = useState<TopSearch[]>([])

	useEffect(() => {
		getTopSearches()
			.then((res: any) => {
				const searches = res?.searches ?? []
				setSearches(searches.slice(0, 5))
			})
			.catch((err: unknown) => {
				console.log('err: ', err)
			})
	}, [])

	return (
		<View
			className={`${className || ''}`}
			{...rest}>
			<Text className='font-bold text-sm'>{t('topSearches.title')}</Text>
			<View className='mt-2 flex flex-col gap-2'>
				{searches?.map((search, idx) => (
					<View
						key={search?.term}
						className={'flex items-center gap-4'}
						onClick={() => onSubmit(search?.term)}>
						<View className={'bg-primary rounded-2xl text-primary-content px-3 text-sm'}>{idx + 1}</View>
						<Text className=''>{search?.term}</Text>
					</View>
				))}
			</View>
		</View>
	)
}
