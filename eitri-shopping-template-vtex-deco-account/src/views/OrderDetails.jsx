import Eitri from 'eitri-bifrost'
import { Vtex } from 'eitri-shopping-vtex-shared'
import { useTranslation } from 'eitri-i18n'
import {
	HeaderContentWrapper,
	HeaderReturn,
	HeaderText,
	Loading,
	BottomInset,
	GenericBox,
	MapPinIcon,
	CreditCardIcon,
	FileTextIcon,
	PackageIcon,
	TruckIcon,
	CopyIcon,
	useRetractableBottomBar
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

const ShoppingBagIcon = () => (
	<svg
		width='16'
		height='20'
		viewBox='0 0 16 20'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'>
		<path
			d='M12.5715 5C12.5715 2.24301 10.5207 0 8 0C5.47929 0 3.42857 2.24301 3.42857 5H0V16.875C0 18.6009 1.27918 20 2.85715 20H13.1428C14.7208 20 16 18.6009 16 16.875V5H12.5715ZM8 1.25C9.89058 1.25 11.4285 2.93223 11.4285 5H4.57143C4.57143 2.93223 6.10947 1.25 8 1.25ZM14.8572 16.875C14.8572 17.9089 14.0881 18.75 13.1428 18.75H2.85715C1.91189 18.75 1.14285 17.9089 1.14285 16.875V6.25H3.42857V8.125C3.42857 8.47019 3.68443 8.75 4 8.75C4.31557 8.75 4.57143 8.47019 4.57143 8.125V6.25H11.4285V8.125C11.4285 8.47019 11.6844 8.75 12 8.75C12.3156 8.75 12.5715 8.47019 12.5715 8.125V6.24545V4.54545H14.8572V16.875Z'
			fill='currentColor'
		/>
	</svg>
)

const SectionCard = ({ icon: Icon, label, children }) => (
	<View className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
		<View className='flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50'>
			{/*<Icon size={15} className='text-primary' />*/}
			<Text className='text-xs font-bold uppercase tracking-wide text-gray-600'>{label}</Text>
		</View>
		<View className='p-4'>{children}</View>
	</View>
)

export default function OrderDetails(props) {
	const [order, setOrder] = useState(null)
	const [isLoading, setIsLoading] = useState(false)
	const [cancelConfirmation, setCancelConfirmation] = useState(false)
	const [cancelReason, setCancelReason] = useState('')

	const { t } = useTranslation()
	useRetractableBottomBar()

	useEffect(() => {
		const { order, orderId } = props?.history?.location?.state

		if (order) {
			setOrder(order)
		} else if (orderId) {
			handleOrder(orderId)
		} else {
			Eitri.navigation.back()
			return
		}

		addonUserTappedActiveTabListener()
		sendScreenView('Detalhes do pedido', 'OrderDetails')
	}, [])

	const handleOrder = async id => {
		setIsLoading(true)
		try {
			const orderData = await getOrderById(id)
			setOrder(orderData)
		} catch (error) {
			console.error('Erro ao pegar detalhes do pedido:', error)
			Eitri.navigation.back()
		} finally {
			setIsLoading(false)
		}
	}

	const cancelOrder = async () => {
		if (!cancelReason) return
		setIsLoading(true)
		try {
			await Vtex.customer.cancelOrder(order?.orderId, { reason: cancelReason })
			Eitri.navigation.back()
		} catch (e) {
			console.error('Erro ao cancelar pedido', e)
			setIsLoading(false) // Garante que o loading para em caso de erro
		}
	}

	const getFormattedPaymentSystem = payment => {
		if (!payment) return null

		// Boleto
		if (payment.paymentSystem === '6') {
			return (
				<View className='flex w-full items-center justify-between'>
					<Text className='text-sm text-gray-800'>{payment.paymentSystemName}</Text>
					{order?.status === 'payment-pending' && (
						<View
							className='cursor-pointer'
							onClick={() => Eitri.openBrowser({ url: payment.url })}>
							<Text className='text-sm font-bold text-blue-600 hover:underline'>
								{t('orderDetails.lbSeeBilling')}
							</Text>
						</View>
					)}
				</View>
			)
		}

		// Outros (Cartão, etc)
		const name = payment.paymentSystemName || ''
		const value = payment.value ? ` ${formatPriceInCents(payment.value)}` : ''
		const installments = payment.installments > 1 ? ` (${payment.installments}x)` : ''
		return <Text className='text-sm text-gray-800'>{`${name}${value}${installments}`}</Text>
	}

	const handleShippingEstimate = shippingEstimate => {
		return shippingEstimate.replace(/[a-zA-Z]/g, '')
	}

	if (isLoading) {
		return (
			<Page>
				<HeaderContentWrapper>
					<HeaderReturn />
					<HeaderText text={t('orderDetails.title')} />
				</HeaderContentWrapper>
				<Loading fullScreen />
			</Page>
		)
	}

	if (!order) {
		return
	}

	return (
		<ProtectedView
			afterLoginRedirectTo={'OrderDetails'}
			redirectState={{ orderId: order?.orderId }}>
			<Page title={'Detalhes do pedido'}>
				<HeaderContentWrapper>
					<HeaderReturn />
					<HeaderText text={t('orderDetails.title')} />
				</HeaderContentWrapper>

				{/* Hero: status + ID */}
				<View className='bg-white px-4 pt-4 pb-5 border-b border-gray-100'>
					<OrderStatusBadge
						order={order}
						statusId={order?.status}
						statusDescription={order?.statusDescription}
					/>
					<View className='flex items-center gap-2 mt-3'>
						<Text className='text'>{t('orderDetails.order', { orderId: order?.orderId })}</Text>
						<View
							onClick={() => {
								Eitri.clipboard.setText({ text: order?.orderId })
							}}>
							<CopyIcon
								size={12}
								className='text-gray-400'
							/>
						</View>
					</View>
					<Text className='text-xs text-gray-500 mt-0.5'>{formatDateDaysMonthYear(order?.creationDate)}</Text>
				</View>

				<View className='p-4 flex flex-col gap-4'>
					{/* Endereço */}
					<SectionCard
						icon={MapPinIcon}
						label={
							order?.shippingData?.address?.addressType !== 'residential'
								? t('orderDetails.addressPickup')
								: t('orderDetails.addressDelivery')
						}>
						<Text className='text-sm text-gray-800 leading-5'>
							{`${order?.shippingData?.address?.street}, ${order?.shippingData?.address?.number}${
								order?.shippingData?.address?.complement
									? ` - ${order?.shippingData?.address?.complement}`
									: ''
							}`}
						</Text>
						<Text className='text-sm text-gray-600 mt-0.5'>
							{`${order?.shippingData?.address?.neighborhood}, ${order?.shippingData?.address?.city} - ${order?.shippingData?.address?.state}`}
						</Text>
						<Text className='text-xs text-gray-500 mt-0.5'>{order?.shippingData?.address.postalCode}</Text>
					</SectionCard>

					{/* Pagamento */}
					<SectionCard
						icon={CreditCardIcon}
						label={t('orderDetails.payment')}>
						{order?.paymentData?.transactions[0]?.payments?.map((payment, index) => (
							<View key={index}>{getFormattedPaymentSystem(payment)}</View>
						))}
					</SectionCard>

					{/* Resumo */}
					<SectionCard
						icon={FileTextIcon}
						label={t('orderDetails.summary')}>
						<View className='flex flex-col gap-2'>
							{order?.totals?.map(
								total =>
									total.value > 0 && (
										<View
											key={total.id}
											className='flex justify-between items-center'>
											<Text className='text-sm text-gray-600'>{total?.name}</Text>
											<Text className='text-sm text-gray-800'>
												{formatPriceInCents(total.value)}
											</Text>
										</View>
									)
							)}
							<View className='flex justify-between items-center border-t border-gray-100 pt-2 mt-1'>
								<Text className='text-sm font-bold text-gray-900'>{t('orderDetails.lbTotal')}</Text>
								<Text className='text-base font-bold text-primary'>
									{formatPriceInCents(
										order?.totals.map(item => item.value).reduce((acc, curr) => acc + curr, 0)
									)}
								</Text>
							</View>
						</View>
					</SectionCard>

					{/* Timeline de status */}
					{!CANCELED_STATUSES.includes(order.status) && (
						<SectionCard
							icon={TruckIcon}
							label={''}>
							<OrderStatusTimeline order={order} />
						</SectionCard>
					)}

					{/* Pacotes ou produtos */}
					{order?.packageAttachment?.packages?.length > 0 ? (
						<View className='flex flex-col gap-3'>
							{order.packageAttachment.packages.map((pkg, index) => {
								const firstItemIndex = pkg.items?.[0]?.itemIndex ?? 0
								const logistics = order.shippingData?.logisticsInfo?.find(
									l => l.itemIndex === firstItemIndex
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
										icon={PackageIcon}
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
													<Text className='text-xs font-medium text-gray-800'>
														{tipoEnvio}
													</Text>
												</View>
											)}
											{transportadora && (
												<View className='flex justify-between'>
													<Text className='text-xs text-gray-500'>
														{t('orderDetails.packageCarrier')}
													</Text>
													<Text className='text-xs font-medium text-gray-800'>
														{transportadora}
													</Text>
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
											{pkg.invoiceKey && (
												<View className='flex justify-between items-center'>
													<Text className='text-xs text-gray-500'>
														{t('orderDetails.packageNFe')}
													</Text>
													<View
														onClick={() =>
															Eitri.openBrowser({
																url: pkg?.invoiceUrl?.includes('www.nfe.fazenda.gov.br')
																	? pkg.invoiceUrl
																	: `https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx?nfe=${pkg.invoiceKey}`,
																inApp: true
															})
														}>
														<Text className='text-xs font-bold text-primary'>
															{t('orderDetails.packageAccess')}
														</Text>
													</View>
												</View>
											)}
											{pkg.trackingNumber && (
												<View className='flex justify-between items-center'>
													<Text className='text-xs text-gray-500'>
														{t('orderDetails.packageTracking')}
													</Text>
													{pkg.trackingUrl && (
														<View
															onClick={() =>
																Eitri.openBrowser({ url: pkg.trackingUrl, inApp: true })
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
											{pkg.items?.map((pkgItem, i) => {
												const product = order.items[pkgItem.itemIndex]
												if (!product) return null
												return (
													<View
														key={i}
														className='flex items-center gap-3'>
														<View className='w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0'>
															<ImageCard
																imageUrl={product.imageUrl}
																className='w-full h-full object-cover'
															/>
														</View>
														<View className='flex flex-1 flex-col'>
															<Text className='text-sm text-gray-800 font-medium line-clamp-2'>
																{product.name}
															</Text>
															<Text className='text-xs text-gray-500 mt-0.5'>
																{`${pkgItem.quantity} un. • ${formatPriceInCents(pkgItem.price)}`}
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
						<SectionCard
							icon={ShoppingBagIcon}
							label={t('orderDetails.orderProducts')}>
							<View className='flex flex-col gap-3'>
								{order.items?.map((item, index) => (
									<View
										key={item.uniqueId || index}
										className='flex items-center gap-3'>
										<View className='w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0'>
											<ImageCard
												imageUrl={item.imageUrl}
												className='w-full h-full object-cover'
											/>
										</View>
										<View className='flex flex-1 flex-col'>
											<Text className='text-sm text-gray-800 font-medium line-clamp-2'>
												{item.name}
											</Text>
											<Text className='text-xs text-gray-500 mt-0.5'>
												{`${item.quantity} un. • ${formatPriceInCents(item.sellingPrice)}`}
											</Text>
										</View>
									</View>
								))}
							</View>
						</SectionCard>
					)}

					{/* Cancelamento */}
					{order?.allowCancellation && (
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
										onChange={e => {
											const val = e.target ? e.target.value : e
											setCancelReason(val)
										}}>
										<Select.Item value='Não quero mais este produto.'>
											{t('orderDetails.valueCancelReasonNoMoreItems')}
										</Select.Item>
										<Select.Item value='Comprei sem querer.'>
											{t('orderDetails.valueCancelReasonAccidentallyBuy')}
										</Select.Item>
										<Select.Item value='A entrega vai demorar demais.'>
											{t('orderDetails.valueCancelReasonSlowDelivery')}
										</Select.Item>
										<Select.Item value='Encontrei um preço melhor em outro lugar.'>
											{t('orderDetails.valueCancelReasonFoundABetterPrice')}
										</Select.Item>
										<Select.Item value='Prefiro não informar.'>
											{t('orderDetails.valueCancelReasonPrefferNotInform')}
										</Select.Item>
										<Select.Item value='Outro'>
											{t('orderDetails.valueCancelReasonOther')}
										</Select.Item>
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
