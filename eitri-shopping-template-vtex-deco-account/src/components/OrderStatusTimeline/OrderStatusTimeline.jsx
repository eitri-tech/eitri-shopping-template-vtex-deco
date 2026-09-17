import { View, Text } from 'eitri-luminus'
import { getOrderStages } from '../../utils/getFullOrderState'
import { useTranslation } from 'eitri-i18n'

export default function OrderStatusTimeline({ order, title }) {
	const { t } = useTranslation()
	const stages = getOrderStages(order)
	const displayTitle = title ?? t('orderStatusTimeline.title')

	return (
		<View>
			<Text className='text-base font-semibold text-gray-800'>{displayTitle}</Text>

			<View className='mt-3 flex flex-col gap-[16px]'>
				{stages.map((stage, index) => {
					const isLast = index === stages.length - 1
					const isDone = stage.state === 'done'
					const isDoing = stage.state === 'doing'
					const isActive = isDone || isDoing

					return (
						<View
							key={stage.label}
							className='flex flex-row items-center gap-3'>
							<View className='relative h-[18px] w-[18px] shrink-0'>
								{isDoing ? (
									<View className='flex h-[18px] w-[18px] rounded-full border-2 border-[#40A040] items-center justify-center bg-white'>
										<View className='h-[8px] w-[8px] rounded-full bg-[#40A040]' />
									</View>
								) : (
									<View
										className={`h-[18px] w-[18px] rounded-full ${isActive ? 'bg-[#40A040]' : 'bg-gray-300'}`}
									/>
								)}

								{!isLast && (
									<View
										className={`absolute left-[8px] top-[18px] h-[22px] w-[2px] ${isActive ? 'bg-[#40A040]' : 'bg-gray-300'}`}
									/>
								)}
							</View>

							<Text
								className={`text-sm ${isDoing ? 'font-semibold text-gray-900' : isDone ? 'text-gray-700' : 'text-gray-400'}`}>
								{stage.label}
							</Text>
						</View>
					)
				})}
			</View>
		</View>
	)
}
