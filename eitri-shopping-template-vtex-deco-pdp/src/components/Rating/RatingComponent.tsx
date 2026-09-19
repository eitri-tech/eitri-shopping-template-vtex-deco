import { Text, View } from 'eitri-luminus'
import { Rating } from 'eitri-shopping-template-vtex-deco-shared'
import { useTranslation } from 'eitri-i18n'

interface RatingInfo {
	rating?: number
	count?: number
}

interface CompositionEntry {
	_id: number
	count: number
	[key: string]: unknown
}

interface StarProps {
	filled?: boolean
	size?: 'sm' | 'md' | 'lg'
}

const Star = ({ filled = true, size = 'md' }: StarProps) => {
	const sizes: Record<string, string> = { sm: 'text-sm', md: 'text-xl', lg: 'text-5xl' }
	return <Text className={`${sizes[size]} leading-none ${filled ? 'text-yellow-400' : 'text-gray-300'}`}>★</Text>
}

interface RatingBarProps {
	stars: number
	percentage: number
}

const RatingBar = ({ stars, percentage }: RatingBarProps) => (
	<View className='flex flex-row items-center gap-3'>
		<View
			className='flex flex-row items-center gap-1'
			style={{ minWidth: 20, justifyContent: 'start' }}>
			<Text className='text-sm font-semibold text-gray-700'>{stars}</Text>
			<Star filled />
		</View>

		<View
			className='bg-gray-200 rounded-full overflow-hidden'
			style={{ flex: 1, height: 12 }}>
			<View
				className='h-full bg-yellow-400 rounded-full'
				style={{ width: `${percentage}%` }}
			/>
		</View>

		<Text className='text-sm text-gray-500 w-[55px] text-right'>{percentage.toFixed(2)}%</Text>
	</View>
)

interface RatingComponentProps {
	rating?: RatingInfo
	composition: CompositionEntry[]
}

export default function RatingComponent(props: RatingComponentProps) {
	const { rating, composition } = props
	const { t } = useTranslation()

	const _compositionData = [1, 2, 3, 4, 5].map(id => {
		const found = composition.find(item => item._id === id)
		if (found) {
			return {
				...found,
				// rating.count can be missing — dividing by it silently produced NaN, which then
				// rendered as the literal text "NaN%" on the progress bar.
				percentage: rating?.count ? (found.count * 100) / rating.count : 0
			}
		}
		return { _id: id, count: 0, percentage: 0 }
	})

	return (
		<View className={'mt-4'}>
			<View className={'flex flex-row items-center justify-between w-full gap-3 px-4'}>
				<View className='flex flex-row items-center gap-2'>
					<Rating ratingValue={rating?.rating ?? 0} />
					<Text className='font-bold'>{rating?.rating}</Text>
				</View>

				<Text className='text-sm text-gray-500'>{t('rating.txtCount', { count: rating?.count })}</Text>
			</View>

			<View className={'border border-b-gray-600 w-full h-[1px] opacity-15 my-6'} />

			{/* Composição da nota */}
			<View className={'px-4'}>
				<Text className='font-bold'>{t('rating.txtComposition')}</Text>

				<View className={'flex flex-col mt-4'}>
					{_compositionData?.map(item => (
						<RatingBar
							key={item._id}
							stars={item._id}
							percentage={item.percentage}
						/>
					))}
				</View>
			</View>
		</View>
	)
}
