import { useEffect, useState } from 'react'
import { Text, View } from 'eitri-luminus'
import { Loading } from 'eitri-shopping-template-vtex-deco-shared'
import { FiX } from 'react-icons/fi'
import { useTranslation } from 'eitri-i18n'
import { listSubscriptionCycles } from '../../services/SubscriptionService'
import { formatDateDaysMonthYear } from '../../utils/utils'
import { cycleLabel } from '../../utils/subscription'
import type { VtexSubscriptionCycle } from '../../types/vtex'

interface CycleWithDate extends VtexSubscriptionCycle {
	id?: string
	date?: string
}

const DOT_COLORS: Record<string, string> = {
	SUCCESS: 'bg-success',
	SUCCESS_WITH_PARTIAL_ORDER: 'bg-success',
	SUCCESS_WITH_NO_ORDER: 'bg-success',
	SKIPED: 'bg-gray-400',
	IN_PROCESS: 'bg-info',
	TRIGGERED: 'bg-info',
	RE_TRIGGERED: 'bg-info',
	SCHEDULE_UPDATED: 'bg-info'
}

interface SubscriptionHistoryModalProps {
	show?: boolean
	subscriptionId?: string
	onClose?: () => void
}

export default function SubscriptionHistoryModal(props: SubscriptionHistoryModalProps) {
	const { show, subscriptionId, onClose } = props
	const { t } = useTranslation()
	const [cycles, setCycles] = useState<CycleWithDate[]>([])
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		if (!show || !subscriptionId) return
		setIsLoading(true)
		listSubscriptionCycles(subscriptionId)
			.then(result =>
				setCycles(
					[...((result as CycleWithDate[] | undefined) || [])].sort(
						(a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
					)
				)
			)
			.catch(e => console.error('listSubscriptionCycles error', e))
			.finally(() => setIsLoading(false))
	}, [show, subscriptionId])

	if (!show) return null

	return (
		<View className='z-[9999] !bg-black/70 !opacity-100 fixed inset-0 flex items-center justify-center'>
			<View className='flex flex-col p-4 bg-white rounded-lg w-11/12 max-w-sm max-h-[70vh] overflow-y-auto'>
				<View className='flex justify-between items-center mb-4'>
					<Text className='font-bold text-lg text-gray-900'>{t('subscriptions.history')}</Text>
					<View
						className='p-1'
						onClick={onClose}>
						<FiX
							size={20}
							className='text-gray-700'
						/>
					</View>
				</View>

				{isLoading && (
					<View className='flex justify-center py-4'>
						<Loading isLoading={true} />
					</View>
				)}

				{!isLoading && cycles.length === 0 && (
					<Text className='text-gray-600 text-center py-4'>{t('subscriptions.historyEmpty')}</Text>
				)}

				{!isLoading &&
					cycles.map((cycle, index) => (
						<View
							key={cycle.id}
							className='flex flex-row gap-3'>
							<View className='flex flex-col items-center w-[14px]'>
								<View
									className={`h-[12px] w-[12px] rounded-full mt-1 ${DOT_COLORS[cycle.status ?? ''] || 'bg-error'}`}
								/>
								{index < cycles.length - 1 && <View className='flex-1 w-[2px] bg-gray-200 my-1' />}
							</View>
							<View className='flex flex-col pb-4'>
								<Text className='text-sm text-gray-900'>{cycleLabel(cycle, t as any)}</Text>
								<Text className='text-xs text-gray-500'>{formatDateDaysMonthYear(cycle.date ?? '')}</Text>
							</View>
						</View>
					))}
			</View>
		</View>
	)
}
