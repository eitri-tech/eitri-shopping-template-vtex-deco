import { getTopSearches } from '../../services/SearchMetadataService'
import { useTranslation } from 'eitri-i18n'

export default function TopSearches(props) {
	const { onSubmit, className, ...rest } = props
	const { t } = useTranslation()

	const [searches, setSearches] = useState([])

	useEffect(() => {
		getTopSearches()
			.then(res => {
				const searches = res?.searches
				setSearches(searches.slice(0, 5))
			})
			.catch(err => {
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
						className={''}
						onClick={() => onSubmit(search?.term)}>
						<Text className=''>{search?.term}</Text>
					</View>
				))}
			</View>
		</View>
	)
}
