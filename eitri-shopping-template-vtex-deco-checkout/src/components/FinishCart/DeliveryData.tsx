import { Text, View } from 'eitri-luminus'
import SimpleCard from '../Card/SimpleCard'
import iconTruck from '../../assets/images/truck.svg'
import iconStore from '../../assets/images/store.svg'
import { useTranslation } from 'eitri-i18n'
import { useLocalShoppingCart } from '../../providers/LocalCart'
import { navigate } from '../../services/navigationService'
import { shippingResolver } from 'eitri-shopping-template-vtex-deco-shared'
import type { ShippingResolverResult } from 'eitri-shopping-template-vtex-deco-shared'
import ReviewMiniProducts from './components/ReviewMiniProducts'

type CurrentDelivery = ShippingResolverResult['current'][number]

export default function DeliveryData() {
	const { cart } = useLocalShoppingCart()
	const { t } = useTranslation()

	const shipping = cart ? shippingResolver(cart) : null

	const onPressMainAction = () => {
		navigate('ShippingMethods')
	}

	const currentDeliveries: CurrentDelivery[] = shipping?.current ?? []

	return (
		<View className='flex flex-col gap-4'>
			{currentDeliveries.map(currentDelivery => (
				<SimpleCard
					key={currentDelivery.id}
					isFilled
					title={currentDelivery?.isPickupInPoint ? t('deliveryData.txtWithdrawal') : t('deliveryData.txtDelivery')}
					icon={currentDelivery?.isPickupInPoint ? iconStore : iconTruck}
					onPress={onPressMainAction}>
					<View className='flex flex-row'>
						{currentDelivery?.isPickupInPoint ? (
							<View className='flex flex-col gap-3'>
								<View className='flex flex-row items-center justify-between gap-2'>
									<Text className='text-sm font-medium'>{currentDelivery?.name ?? ''}</Text>
									<Text
										className={`text-sm font-bold ${
											currentDelivery.formatedPrice === 'Grátis' ? 'text-green-600' : ''
										}`}>
										{currentDelivery.formatedPrice}
									</Text>
								</View>

								{/* Pickup Estimate */}
								{currentDelivery.formattedShippingEstimate && (
									<View className='flex flex-row items-center gap-2'>
										<svg
											width='16'
											height='16'
											viewBox='0 0 16 16'
											fill='none'
											xmlns='http://www.w3.org/2000/svg'>
											<path
												d='M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 12.5c-3.038 0-5.5-2.462-5.5-5.5S4.962 2.5 8 2.5s5.5 2.462 5.5 5.5-2.462 5.5-5.5 5.5z'
												fill='#16A34A'
											/>
											<path
												d='M8 4v4l3 2'
												stroke='#16A34A'
												strokeWidth='1'
												fill='none'
											/>
										</svg>
										<Text className='text-xs text-green-700 font-medium'>
											{currentDelivery.formattedShippingEstimate}
										</Text>
									</View>
								)}

								{/* Store Address */}
								<View className='bg-neutral-50 p-3 rounded-lg w-full'>
									<Text className='text-sm font-medium mb-2'>{t('deliveryData.txtStoreAddress')}</Text>
									<View className='flex flex-col gap-1'>
										<Text className='text-xs text-neutral-600'>
											{`${currentDelivery?.pickupStoreInfo?.address?.street ?? ''}, ${currentDelivery?.pickupStoreInfo?.address?.number ?? ''}${
												currentDelivery?.pickupStoreInfo?.address?.complement
													? ` - ${currentDelivery?.pickupStoreInfo?.address?.complement}`
													: ''
											}`}
										</Text>
										<Text className='text-xs text-neutral-600'>
											{`${currentDelivery?.pickupStoreInfo?.address?.neighborhood ?? ''}, ${currentDelivery?.pickupStoreInfo?.address?.city ?? ''} - ${currentDelivery?.pickupStoreInfo?.address?.state ?? ''}`}
										</Text>
										<Text className='text-xs text-neutral-600'>
											{t('deliveryData.txtPostalCode', {
												code: currentDelivery?.pickupStoreInfo?.address?.postalCode ?? ''
											})}
										</Text>
									</View>
								</View>

								{/* Important Information */}
								{currentDelivery?.pickupStoreInfo?.additionalInfo != null && (
									<View className='bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400'>
										<View className='flex flex-row items-start gap-2'>
											<svg
												width='16'
												height='16'
												viewBox='0 0 16 16'
												fill='none'
												xmlns='http://www.w3.org/2000/svg'
												className='mt-0.5 flex-shrink-0'>
												<path
													d='M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 12.5c-3.038 0-5.5-2.462-5.5-5.5S4.962 2.5 8 2.5s5.5 2.462 5.5 5.5-2.462 5.5-5.5 5.5z'
													fill='#2563EB'
												/>
												<path
													d='M8 6v4M8 4h.01'
													stroke='white'
													strokeWidth='1.5'
													strokeLinecap='round'
													strokeLinejoin='round'
												/>
											</svg>
											<Text className='text-xs text-blue-800 leading-relaxed'>
												{String(currentDelivery.pickupStoreInfo.additionalInfo)}
											</Text>
										</View>
									</View>
								)}

								<ReviewMiniProducts products={currentDelivery.products} />
							</View>
						) : (
							<View className='flex flex-col gap-3 w-full'>
								<View className='flex flex-row items-center justify-between'>
									<Text className='text-sm font-medium'>{currentDelivery.name ?? ''}</Text>
									<Text
										className={`text-sm font-bold ${
											currentDelivery.formatedPrice === 'Grátis' ? 'text-green-600' : ''
										}`}>
										{currentDelivery.formatedPrice}
									</Text>
								</View>

								{/* Delivery Estimate */}
								{currentDelivery.formattedShippingEstimate && (
									<View className='flex flex-row items-center gap-2'>
										<svg
											width='16'
											height='16'
											viewBox='0 0 16 16'
											fill='none'
											xmlns='http://www.w3.org/2000/svg'>
											<path
												d='M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 12.5c-3.038 0-5.5-2.462-5.5-5.5S4.962 2.5 8 2.5s5.5 2.462 5.5 5.5-2.462 5.5-5.5 5.5z'
												fill='#16A34A'
											/>
											<path
												d='M8 4v4l3 2'
												stroke='#16A34A'
												strokeWidth='1'
												fill='none'
											/>
										</svg>
										<Text className='text-xs text-green-700 font-medium'>
											{currentDelivery.formattedShippingEstimate}
										</Text>
									</View>
								)}

								{/* Delivery Address */}
								<View className='bg-neutral-50 p-3 rounded-lg'>
									<Text className='text-sm font-medium mb-2'>{t('deliveryData.txtDeliveryAddress')}</Text>
									<View className='flex flex-col gap-1'>
										<Text className='text-xs text-neutral-600'>
											{`${currentDelivery?.address?.street ?? ''}, ${
												currentDelivery?.address?.number == null
													? t('deliveryData.txtNoNumber')
													: currentDelivery.address.number
											}${currentDelivery?.address?.complement ? ` - ${currentDelivery.address.complement}` : ''}`}
										</Text>
										<Text className='text-xs text-neutral-600'>
											{`${currentDelivery?.address?.neighborhood ?? ''}, ${currentDelivery?.address?.city ?? ''} - ${currentDelivery?.address?.state ?? ''}`}
										</Text>
										<Text className='text-xs text-neutral-600'>{`CEP: ${currentDelivery?.address?.postalCode ?? ''}`}</Text>
									</View>
								</View>

								<ReviewMiniProducts products={currentDelivery.products} />
							</View>
						)}
					</View>
				</SimpleCard>
			))}
		</View>
	)
}
