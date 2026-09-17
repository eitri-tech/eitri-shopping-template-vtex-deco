import { useTranslation } from 'eitri-i18n'
import CollapseWrapper from './components/CollapseWrapper'
import { GenericBox } from 'eitri-shopping-template-vtex-deco-shared'

export default function Description(props) {
	const { description } = props

	const [showMore, setShowMore] = useState(false)
	const isLongDescription = description?.length > 100

	const { t } = useTranslation()

	const toggleShowMore = () => {
		setShowMore(!showMore)
	}

	return (
		<GenericBox className='flex flex-col gap-4'>
			<CollapseWrapper
				title={t('description.txtDescription')}
				defaltCollpased={false}>
				<View
					id={'desc-field'}
					className={`${!showMore ? 'max-h-[150px]' : ''} overflow-y-hidden relative`}>
					<HTMLRender html={description} />

					{!showMore && isLongDescription && (
						<View className='absolute bottom-0 right-0 w-full h-[50px] bg-gradient-to-t from-white to-transparent pointer-events-none' />
					)}
				</View>
				{isLongDescription && (
					<View onClick={toggleShowMore}>
						<Text className='underline font-bold mt-1'>
							{showMore ? t('description.labelSeeLess') : t('description.labelSeeMore')}
						</Text>
					</View>
				)}
			</CollapseWrapper>
		</GenericBox>
	)
}
