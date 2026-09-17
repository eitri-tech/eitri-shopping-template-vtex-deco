import { Text, View } from 'eitri-luminus'
import { getCurrentOrderStageLabel, getOrderBadgeVariant } from '../../utils/getFullOrderState'
import type { VtexOrder } from '../../types/vtex'

const VARIANT_STYLES: Record<string, { wrapper: string; text: string }> = {
	info: { wrapper: 'bg-info', text: 'text-info-content' },
	success: { wrapper: 'bg-success', text: 'text-success-content' },
	warning: { wrapper: 'bg-warning', text: 'text-warning-content' },
	neutral: { wrapper: 'bg-neutral', text: 'text-neutral-content' }
}

interface OrderStatusBadgeProps {
	statusId?: string
	statusDescription?: string
	order: VtexOrder
	[key: string]: unknown
}

export default function OrderStatusBadge(props: OrderStatusBadgeProps) {
	const { statusId, statusDescription, order, ...rest } = props

	const variant = getOrderBadgeVariant(order)
	const styles = VARIANT_STYLES[variant] ?? VARIANT_STYLES.neutral
	const orderState = getCurrentOrderStageLabel(order)

	return (
		<View
			className={`w-fit inline-flex items-center justify-center px-2 py-1 rounded-lg ${styles.wrapper}`}
			{...rest}>
			<Text className={`text-xs font-bold ${styles.text}`}>{orderState}</Text>
		</View>
	)
}
