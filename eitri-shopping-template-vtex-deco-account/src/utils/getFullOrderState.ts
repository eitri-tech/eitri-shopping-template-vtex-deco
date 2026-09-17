export const CANCELED_STATUSES = [
	'canceled',
	'cancel',
	'cancellation-requested',
	'waiting-for-seller-decision',
	'request-cancel'
]

const isPickupOrder = order =>
	(order.shippingData?.logisticsInfo ?? []).every(i => i.selectedDeliveryChannel === 'pickup-in-point')

const isDelivered = order =>
	order.packageAttachment?.packages?.some(pkg => pkg.courierStatus?.finished === true) ?? false

const getCurrentStageIndex = order => {
	if (isDelivered(order)) return 4

	const { status } = order

	if (status === 'invoice' || status === 'invoiced') return 3

	if (
		[
			'window-to-cancel',
			'ready-for-handling',
			'authorize-fulfillment',
			'release-to-fulfillment',
			'handling',
			'payment-approved',
			'approve-payment'
		].includes(status)
	)
		return 2

	if (status === 'payment-pending') return 1

	return 0
}

const STAGE_LABELS = [
	{
		'not-started': 'Confirmar pedido',
		'doing': 'Confirmando pedido',
		'done': 'Pedido confirmado'
	},
	{
		'not-started': 'Aprovar pagamento',
		'doing': 'Aprovando pagamento',
		'done': 'Pagamento aprovado'
	},
	{
		'not-started': 'Preparar pedido',
		'doing': 'Preparando pedido',
		'done': 'Pedido preparado'
	},
	{
		shipping: {
			'not-started': 'Enviar pedido',
			'doing': 'Enviando pedido',
			'done': 'Pedido enviado'
		},
		pickup: {
			'not-started': 'Enviar para ponto de retirada',
			'doing': 'Enviando para ponto de retirada',
			'done': 'Pronto para retirada'
		}
	},
	{
		shipping: {
			'not-started': 'Entregar pedido',
			'doing': 'Em trânsito',
			'done': 'Pedido entregue'
		},
		pickup: {
			'not-started': 'Retirar',
			'doing': 'Pronto para retirada',
			'done': 'Pedido retirado'
		}
	}
]

const resolveLabel = (labels, state, pickup) => {
	const entry = labels.shipping ? (pickup ? labels.pickup : labels.shipping) : labels
	return entry[state]
}

export const getOrderStages = order => {
	const stageIndex = getCurrentStageIndex(order)
	const pickup = isPickupOrder(order)
	const canceled = CANCELED_STATUSES.includes(order.status)
	const fullyDone = stageIndex === 4

	return STAGE_LABELS.map((labels, index) => {
		const state = canceled
			? 'not-started'
			: fullyDone || index < stageIndex
				? 'done'
				: index === stageIndex
					? 'doing'
					: 'not-started'

		return { label: resolveLabel(labels, state, pickup), state }
	})
}

export const getOrderBadgeVariant = order => {
	if (CANCELED_STATUSES.includes(order?.status)) return 'neutral'
	if (isDelivered(order)) return 'success'
	if (order?.status === 'payment-pending') return 'warning'
	return 'info'
}

export const getCurrentOrderStageLabel = order => {
	if (order.status === 'canceled') return 'Cancelado'
	if (CANCELED_STATUSES.includes(order.status)) return 'Cancelamento Solicitado'

	const stages = getOrderStages(order)
	const doing = stages.find(s => s.state === 'doing')
	return (doing ?? stages[stages.length - 1]).label
}
