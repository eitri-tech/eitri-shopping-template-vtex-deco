import { useEffect, useState } from 'react'
import { Page, Text, View } from 'eitri-luminus'
import { useLocalShoppingCart } from '../providers/LocalCart'
import { useTranslation } from 'eitri-i18n'
import { navigate } from '../services/navigationService'
import { shippingResolver } from 'eitri-shopping-template-vtex-deco-shared'
import type { EnrichedShippingOption } from 'eitri-shopping-template-vtex-deco-shared'
import FixedBottom from '../components/FixedBottom/FixedBottom'
import { HeaderContentWrapper, HeaderReturn, Loading, GenericBox, TrackingService } from 'eitri-shopping-template-vtex-deco-shared'

export default function FreightSelector() {
	const { cart, setFreight } = useLocalShoppingCart()

	const [isLoading, setIsLoading] = useState(false)

	const { t } = useTranslation()

	useEffect(() => {
		TrackingService.sendScreenView('Seleção de frete', 'FreightSelector')
	}, [])

	const onSelectFreightOption = async (freightOption: EnrichedShippingOption) => {
		try {
			setIsLoading(true)
			const slas = freightOption.slas.map(sla => ({
				itemIndex: sla.itemIndex,
				selectedSla: sla.selectedSla,
				selectedDeliveryChannel: sla.selectedDeliveryChannel
			}))

			const payload = {
				clearAddressIfPostalCodeNotFound: false,
				logisticsInfo: slas,
				selectedAddresses: cart?.shippingData?.selectedAddresses
			}
			await setFreight?.(payload)
			navigate('PaymentData', {}, true)
		} catch (error) {
			console.error('Error on select freight option', error)
		} finally {
			setIsLoading(false)
		}
	}

	const shippingOptions = cart ? shippingResolver(cart) : null
	const deliveryOptions = shippingOptions?.options?.filter(opt => !opt.isPickupInPoint)

	const userAddress = cart?.shippingData?.address

	return (
		<Page title='Seleção de frete'>
			<HeaderContentWrapper>
				<HeaderReturn />
			</HeaderContentWrapper>

			<Loading
				fullScreen
				isLoading={isLoading}
			/>

			<View className='flex-1 flex flex-col p-4 gap-4'>
				<View className='flex flex-col gap-1'>
					<Text className='text-2xl font-bold'>{t('freightSelector.txtTitle')}</Text>
					<Text className='text-sm text-gray-500'>
						{t('freightSelector.txtDeliverAt', {
							street: userAddress?.street ?? '',
							number: userAddress?.number || '',
							complement: userAddress?.complement || ''
						})}
					</Text>
				</View>

				<View className='flex flex-col gap-4'>
					{(deliveryOptions ?? []).map((item, index) => (
						<GenericBox
							key={index}
							className='p-4 w-full rounded-xl border border-gray-100 flex flex-col gap-3'
							onClick={() => onSelectFreightOption(item)}>
							<Text className='font-bold text-lg block'>{item?.formattedShippingEstimate}</Text>
							<Text className={`font-semibold ${item.price === 0 ? 'text-green-600' : 'text-base-content/70'}`}>
								{item?.formatedPrice}
							</Text>
							<Text className='text-primary font-bold underline'>{t('freightSelector.txtContinue')}</Text>
						</GenericBox>
					))}
				</View>
			</View>

			<FixedBottom className='flex flex-col align-center gap-4'>
				<View onClick={() => navigate('AddressSelector', {}, true)}>
					<Text className='text-primary text-center font-bold block'>{t('freightSelector.txtChangeAddress')}</Text>
				</View>
			</FixedBottom>
		</Page>
	)
}
