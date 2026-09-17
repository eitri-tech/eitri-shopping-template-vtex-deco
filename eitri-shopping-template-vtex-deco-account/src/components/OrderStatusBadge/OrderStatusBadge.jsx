import { getCurrentOrderStageLabel, getOrderBadgeVariant } from '../../utils/getFullOrderState'

const VARIANT_STYLES = {
	info: { wrapper: 'bg-info', text: 'text-info-content' },
	success: { wrapper: 'bg-success', text: 'text-success-content' },
	warning: { wrapper: 'bg-warning', text: 'text-warning-content' },
	neutral: { wrapper: 'bg-neutral', text: 'text-neutral-content' }
}

export default function OrderStatusBadge(props) {
	const { statusId, statusDescription, order, ...rest } = props

	const variant = getOrderBadgeVariant(order)
	const styles = VARIANT_STYLES[variant]
	const orderState = getCurrentOrderStageLabel(order)

	return (
		<View
			className={`w-fit inline-flex items-center justify-center px-2 py-1 rounded-lg ${styles.wrapper}`}
			{...rest}>
			<Text className={`text-xs font-bold ${styles.text}`}>{orderState}</Text>
		</View>
	)
}
