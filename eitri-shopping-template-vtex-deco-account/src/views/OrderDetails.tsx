import { useEffect, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { Page, View, Text, Select } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import { Vtex } from 'eitri-shopping-vtex-shared'
import { useTranslation } from 'eitri-i18n'
import {
	HeaderContentWrapper,
	HeaderReturn,
	HeaderText,
	Loading,
	BottomInset
} from 'eitri-shopping-template-vtex-deco-shared'
import { formatDateDaysMonthYear, formatPriceInCents } from '../utils/utils'
import OrderStatusBadge from '../components/OrderStatusBadge/OrderStatusBadge'
import ProtectedView from '../components/ProtectedView/ProtectedView'
import { getOrderById } from '../services/CustomerService'
import ImageCard from '../components/Image/ImageCard'
import { addonUserTappedActiveTabListener } from '../utils/backToTopListener'
import { sendScreenView } from '../services/TrackingService'
import OrderStatusTimeline from '../components/OrderStatusTimeline/OrderStatusTimeline'
import { CANCELED_STATUSES } from '../utils/getFullOrderState'
import { FiCopy } from 'react-icons/fi'
import type { RouteProps } from '../types/route'
import type { VtexOrder, VtexOrderPayment } from '../types/vtex'

interface OrderDetailsState {
	order?: VtexOrder
	orderId?: string
}

interface SectionCardProps {
	label: string
	children?: ReactNode
}

// The `icon` prop from the JS version was never rendered (commented out) — dropped rather than
// carrying dead props through the type.
function SectionCard(props: SectionCardProps) {
	const { label, children } = props
	return (
		<View className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
			<View className='flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50'>
				<Text className='text-xs font-bold uppercase tracking-wide text-gray-600'>{label}</Text>
			</View>
			<View className='p-4'>{children}</View>
		</View>
	)
}

const CANCEL_REASONS: Array<{ value: string; labelKey: string }> = [
	{ value: 'Não quero mais este produto.', labelKey: 'orderDetails.valueCancelReasonNoMoreItems' },
	{ value: 'Comprei sem querer.', labelKey: 'orderDetails.valueCancelReasonAccidentallyBuy' },
	{ value: 'A entrega vai demorar demais.', labelKey: 'orderDetails.valueCancelReasonSlowDelivery' },
	{ value: 'Encontrei um preço melhor em outro lugar.', labelKey: 'orderDetails.valueCancelReasonFoundABetterPrice' },
	{ value: 'Prefiro não informar.', labelKey: 'orderDetails.valueCancelReasonPrefferNotInform' },
	{ value: 'Outro', labelKey: 'orderDetails.valueCancelReasonOther' }
]

export default function OrderDetails(props: RouteProps<OrderDetailsState>) {
	const [order, setOrder] = useState<VtexOrder | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [cancelConfirmation, setCancelConfirmation] = useState(false)
	const [cancelReason, setCancelReason] = useState('')

	const { t } = useTranslation()

	useEffect(() => {
		const state = props?.history?.location?.state ?? props?.location?.state
		const incomingOrder = state?.order
		const orderId = state?.orderId

		if (incomingOrder) {
			setOrder(incomingOrder)
		} else if (orderId) {
			handleOrder(orderId)
		} else {
			Eitri.navigation.back(1)
			return
		}

		addonUserTappedActiveTabListener()
		sendScreenView('Detalhes do pedido', 'OrderDetails')
	}, [])

	const handleOrder = async (id: string) => {
		setIsLoading(true)
		try {
			const orderData = (await getOrderById(id)) as VtexOrder | undefined
			if (!orderData) throw new Error('empty order')
			setOrder(orderData)
		} catch (error) {
			console.error('Erro ao pegar detalhes do pedido:', error)
			Eitri.navigation.back(1)
		} finally {
			setIsLoading(false)
		}
	}

	const cancelOrder = async () => {
		if (!cancelReason || !order?.orderId) return
		setIsLoading(true)
		try {
			await Vtex.customer.cancelOrder(order.orderId, { reason: cancelReason })
			Eitri.navigation.back(1)
		} catch (e) {
			console.error('Erro ao cancelar pedido', e)
			setIsLoading(false) // Garante que o loading para em caso de erro
		}
	}

	const getFormattedPaymentSystem = (payment?: VtexOrderPayment) => {
		if (!payment) return null

		// Boleto
		if (payment.paymentSystem === '6') {
			return (
				<View className='flex w-full items-center justify-between'>
					<Text className='text-sm text-gray-800'>{payment.paymentSystemName ?? ''}</Text>
					{order?.status === 'payment-pending' && payment.url && (
						<View onClick={() => Eitri.openBrowser({ url: payment.url as string })}>
							<Text className='text-sm font-bold text-blue-600'>{t('orderDetails.lbSeeBilling')}</Text>
						</View>
					)}
				</View>
			)
		}

		// Outros (Cartão, etc)
		const name = payment.paymentSystemName || ''
		const value = payment.value ? ` ${formatPriceInCents(payment.value)}` : ''
		const installments = (payment.installments ?? 0) > 1 ? ` (${payment.installments}x)` : ''
		return <Text className='text-sm text-gray-800'>{`${name}${value}${installments}`}</Text>
	}

	if (isLoading) {
		return (
			<Page>
				<HeaderContentWrapper>
					<HeaderReturn />
					<HeaderText text={t('orderDetails.title')} />
				</HeaderContentWrapper>
				<Loading
					fullScreen
					isLoading
				/>
			</Page>
		)
	}

	if (!order) {
		return null
	}

	const address = order.shippingData?.address
	const addressLine1 = [address?.street, address?.number].filter(Boolean).join(', ')
	const addressLine1Full = address?.complement ? `${addressLine1} - ${address.complement}` : addressLine1
	const addressLine2 = [address?.neighborhood, address?.city].filter(Boolean).join(', ')
	const addressLine2Full = address?.state ? `${addressLine2} - ${address.state}` : addressLine2

	const payments = order.paymentData?.transactions?.[0]?.payments ?? []
	const totals = order.totals ?? []
	const orderTotal = totals.reduce((acc, curr) => acc + (curr?.value ?? 0), 0)
	const packages = order.packageAttachment?.packages ?? []
	const items = order.items ?? []

	return (
		<ProtectedView
			afterLoginRedirectTo={'OrderDetails'}
			redirectState={{ orderId: order.orderId }}>
			<Page title={'Detalhes do pedido'}>
				<HeaderContentWrapper>
					<HeaderReturn />
					<HeaderText text={t('orderDetails.title')} />
				</HeaderContentWrapper>

				{/* Hero: status + ID */}
				<View className='bg-white px-4 pt-4 pb-5 border-b border-gray-100'>
					<OrderStatusBadge
						order={order}
						statusId={order.status}
						statusDescription={order.statusDescription}
					/>
					<View className='flex items-center gap-2 mt-3'>
						<Text className='text'>{t('orderDetails.order', { orderId: order.orderId ?? '' })}</Text>
						<View
							onClick={() => {
								if (order.orderId) Eitri.clipboard.setText({ text: order.orderId })
							}}>
							<FiCopy
								size={12}
								className='text-gray-400'
							/>
						</View>
					</View>
					<Text className='text-xs text-gray-500 mt-0.5'>
						{order.creationDate ? formatDateDaysMonthYear(order.creationDate) : '—'}
					</Text>
				</View>

				<View className='p-4 flex flex-col gap-4'>
					{/* Endereço */}
					<SectionCard
						label={
							address?.addressType !== 'residential'
								? t('orderDetails.addressPickup')
								: t('orderDetails.addressDelivery')
						}>
						<Text className='text-sm text-gray-800 leading-5'>{addressLine1Full || '—'}</Text>
						<Text className='text-sm text-gray-600 mt-0.5'>{addressLine2Full || '—'}</Text>
						<Text className='text-xs text-gray-500 mt-0.5'>{address?.postalCode ?? ''}</Text>
					</SectionCard>

					{/* Pagamento */}
					<SectionCard label={t('orderDetails.payment')}>
						{payments.map((payment, index) => (
							<View key={index}>{getFormattedPaymentSystem(payment)}</View>
						))}
					</SectionCard>

					{/* Resumo */}
					<SectionCard label={t('orderDetails.summary')}>
						<View className='flex flex-col gap-2'>
							{totals.map(
								total =>
									(total?.value ?? 0) > 0 && (
										<View
											key={total.id ?? total.name}
											className='flex justify-between items-center'>
											<Text className='text-sm text-gray-600'>{total.name ?? ''}</Text>
											<Text className='text-sm text-gray-800'>{formatPriceInCents(total.value)}</Text>
										</View>
									)
							)}
							<View className='flex justify-between items-center border-t border-gray-100 pt-2 mt-1'>
								<Text className='text-sm font-bold text-gray-900'>{t('orderDetails.lbTotal')}</Text>
								<Text className='text-base font-bold text-primary'>{formatPriceInCents(orderTotal)}</Text>
							</View>
						</View>
					</SectionCard>

					{/* Timeline de status */}
					{!CANCELED_STATUSES.includes(order.status ?? '') && (
						<SectionCard label={''}>
							<OrderStatusTimeline order={order} />
						</SectionCard>
					)}

					{/* Pacotes ou produtos */}
					{packages.length > 0 ? (
						<View className='flex flex-col gap-3'>
							{packages.map((pkg, index) => {
								const pkgItems = pkg.items ?? []
								const firstItemIndex = pkgItems[0]?.itemIndex ?? 0
								const logistics = (order.shippingData?.logisticsInfo ?? []).find(
									l => l?.itemIndex === firstItemIndex
								)
								const deliveryChannel = logistics?.selectedDeliveryChannel
								const tipoEnvio =
									deliveryChannel === 'pickup-in-point'
										? t('orderDetails.packagePickup')
										: t('orderDetails.packageDelivery')
								const transportadora = logistics?.deliveryCompany
								const deliveredDate = pkg.courierStatus?.deliveredDate
								const estimatedDate = logistics?.shippingEstimateDate
								const dataEntrega = deliveredDate ?? estimatedDate

								return (
									<SectionCard
										key={index}
										label={t('orderDetails.package', { number: index + 1 })}>
										{/* Badge entregue */}
										{deliveredDate && (
											<View className='inline-flex mb-3'>
												<View className='bg-green-100 px-3 py-1 rounded-full'>
													<Text className='text-xs font-semibold text-green-700'>
														{deliveryChannel === 'pickup-in-point'
															? t('orderDetails.packagePickedUp')
															: t('orderDetails.packageDelivered')}
													</Text>
												</View>
											</View>
										)}

										{/* Info de envio */}
										<View className='flex flex-col gap-2 mb-3'>
											{tipoEnvio && (
												<View className='flex justify-between'>
													<Text className='text-xs text-gray-500'>
														{t('orderDetails.packageDeliveryType')}
													</Text>
													<Text className='text-xs font-medium text-gray-800'>{tipoEnvio}</Text>
												</View>
											)}
											{transportadora && (
												<View className='flex justify-between'>
													<Text className='text-xs text-gray-500'>
														{t('orderDetails.packageCarrier')}
													</Text>
													<Text className='text-xs font-medium text-gray-800'>{transportadora}</Text>
												</View>
											)}
											{dataEntrega && (
												<View className='flex justify-between'>
													<Text className='text-xs text-gray-500'>
														{deliveredDate
															? t('orderDetails.packageDeliveredOn')
															: t('orderDetails.packageEstimatedDelivery')}
													</Text>
													<Text className='text-xs font-medium text-gray-800'>
														{formatDateDaysMonthYear(dataEntrega)}
													</Text>
												</View>
											)}
											{!deliveredDate && (
												<View className='flex justify-between'>
													<Text className='text-xs text-gray-500'>
														{t('orderDetails.packageTracking')}
													</Text>
													{pkg.trackingUrl && (
														<View
															onClick={() =>
																Eitri.openBrowser({ url: pkg.trackingUrl as string, inApp: true })
															}>
															<Text className='text-xs font-bold text-primary'>
																{t('orderDetails.packageTrack')}
															</Text>
														</View>
													)}
												</View>
											)}
										</View>

										{/* Itens do pacote */}
										<View className='flex flex-col gap-3 pt-3 border-t border-gray-100'>
											{pkgItems.map((pkgItem, i) => {
												const product = items[pkgItem?.itemIndex ?? -1]
												if (!product) return null
												return (
													<View
														key={i}
														className='flex items-center gap-3'>
														<View className='w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0'>
															<ImageCard imageUrl={product.imageUrl} />
														</View>
														<View className='flex flex-1 flex-col'>
															<Text className='text-sm text-gray-800 font-medium line-clamp-2'>
																{product.name ?? ''}
															</Text>
															<Text className='text-xs text-gray-500 mt-0.5'>
																{`${pkgItem.quantity ?? 0} un. • ${formatPriceInCents(pkgItem.price)}`}
															</Text>
														</View>
													</View>
												)
											})}
										</View>
									</SectionCard>
								)
							})}
						</View>
					) : (
						<SectionCard label={t('orderDetails.orderProducts')}>
							<View className='flex flex-col gap-3'>
								{items.map((item, index) => (
									<View
										key={item.uniqueId || index}
										className='flex items-center gap-3'>
										<View className='w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0'>
											<ImageCard imageUrl={item.imageUrl} />
										</View>
										<View className='flex flex-1 flex-col'>
											<Text className='text-sm text-gray-800 font-medium line-clamp-2'>
												{item.name ?? ''}
											</Text>
											<Text className='text-xs text-gray-500 mt-0.5'>
												{`${item.quantity ?? 0} un. • ${formatPriceInCents(item.sellingPrice)}`}
											</Text>
										</View>
									</View>
								))}
							</View>
						</SectionCard>
					)}

					{/* Cancelamento */}
					{order.allowCancellation && (
						<View className='bg-white rounded-2xl border border-gray-100 shadow-sm p-4'>
							{cancelConfirmation ? (
								<View className='w-full'>
									<Text className='text-sm font-bold text-gray-800 mb-3'>
										{t('orderDetails.lbCancelReason')}
									</Text>
									<Select
										className='select select-bordered w-full'
										value={cancelReason}
										placeholder={t('orderDetails.lbSelectCancelReason')}
										onChange={(e: ChangeEvent<HTMLSelectElement>) =>
											setCancelReason(e?.target?.value ?? '')
										}>
										{CANCEL_REASONS.map(reason => (
											<Select.Item
												key={reason.value}
												value={reason.value}>
												{t(reason.labelKey)}
											</Select.Item>
										))}
									</Select>
									<View className='flex justify-between mt-4'>
										<View onClick={() => setCancelConfirmation(false)}>
											<Text className='text-sm font-semibold text-gray-500'>
												{t('orderDetails.lbBack')}
											</Text>
										</View>
										<View
											className={!cancelReason ? 'opacity-40' : ''}
											onClick={cancelOrder}>
											<Text
												className={`text-sm font-bold ${cancelReason ? 'text-red-500' : 'text-gray-400'}`}>
												{t('orderDetails.lbContinueCancel')}
											</Text>
										</View>
									</View>
								</View>
							) : (
								<View
									className='flex justify-center py-1'
									onClick={() => setCancelConfirmation(true)}>
									<Text className='text-sm font-bold text-red-500'>{t('orderDetails.lbCancel')}</Text>
								</View>
							)}
						</View>
					)}
				</View>

				<BottomInset />
			</Page>
		</ProtectedView>
	)
}
