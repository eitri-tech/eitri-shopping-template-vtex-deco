import { useEffect, useState } from 'react'
import { useLocalShoppingCart } from '../providers/LocalCart'
import { Page, Text, View } from 'eitri-luminus'
import { useTranslation } from 'eitri-i18n'
import { navigate } from '../services/navigationService'
import { shippingResolver } from 'eitri-shopping-template-vtex-deco-shared'
import type { EnrichedShippingOption } from 'eitri-shopping-template-vtex-deco-shared'
import CardSelector from '../components/CardSelector/CardSelector'
import {
	HeaderContentWrapper,
	HeaderReturn,
	HeaderText,
	BottomInset,
	TrackingService,
	Loading
} from 'eitri-shopping-template-vtex-deco-shared'

export default function PickupSelector() {
	const { cart, setFreight } = useLocalShoppingCart()
	const { t } = useTranslation()

	const [isLoading, setIsLoading] = useState(false)
	const [seeMore, setSeeMore] = useState(false)

	const PAGE = 'Seleção de ponto de retirada'

	useEffect(() => {
		if ((cart?.shippingData?.availableAddresses?.length ?? 0) > 0) {
			TrackingService.sendScreenView('Seleção de ponto de retirada', 'PickupSelector')
		} else {
			handleAddNewAddress()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleAddNewAddress = () => {
		navigate('AddressForm', {}, true)
	}

	const onSelectFreightOption = async (freightOption: EnrichedShippingOption) => {
		try {
			setIsLoading(true)
			const slas = freightOption.slas.map(sla => ({
				itemIndex: sla.itemIndex,
				selectedSla: sla.selectedSla,
				selectedDeliveryChannel: sla.selectedDeliveryChannel ? 'pickup-in-point' : 'delivery'
			}))

			const payload = {
				clearAddressIfPostalCodeNotFound: false,
				logisticsInfo: slas,
				selectedAddresses: cart?.shippingData?.selectedAddresses
			}
			await setFreight?.(payload)
			navigate('PaymentData')
		} catch (error) {
			console.error('Error on select freight option', error)
		} finally {
			setIsLoading(false)
		}
	}

	const shippingOptions = cart ? shippingResolver(cart) : null
	const pickUpOptions = shippingOptions?.options?.filter(opt => opt.isPickupInPoint)

	return (
		<Page title={PAGE}>
			<HeaderContentWrapper>
				<HeaderReturn />
				<HeaderText text={t('pickupSelector.txtHeader')} />
			</HeaderContentWrapper>

			<Loading
				fullScreen
				isLoading={isLoading}
			/>

			<View className='flex-1 flex flex-col p-4'>
				<View>
					<Text className='text-lg font-bold text-base-content'>
						{t('pickupSelector.txtTitle')}
					</Text>
				</View>

				{pickUpOptions?.slice(0, seeMore ? Infinity : 3).map(option => {
					const address = option.pickupStoreInfo?.address

					return (
						<CardSelector
							key={option.id}
							mainTitle={option.pickupStoreInfo?.friendlyName}
							mainClickHandler={() => onSelectFreightOption(option)}
							secondaryActionTitle={option.formattedShippingEstimate}>
							<Text className='text text-base-content/70'>{`${address?.street ?? ''}, ${address?.number ?? ''} ${address?.complement ?? ''}`}</Text>
							<Text className='text text-base-content/70'>{`${address?.neighborhood ?? ''} - ${address?.city ?? ''} - ${address?.state ?? ''}`}</Text>
							<Text className='text text-base-content/70'>{`CEP: ${address?.postalCode ?? ''}`}</Text>
							<Text
								className={`text text-base-content/70 font-bold ${option.price === 0 ? 'text-green-600' : ''}`}>
								{option.formatedPrice}
							</Text>
						</CardSelector>
					)
				})}

				<View
					onClick={() => setSeeMore(!seeMore)}
					className='flex items-center justify-center mt-4 text-primary font-bold'>
					<Text>{seeMore ? t('pickupSelector.txtSeeLess') : t('pickupSelector.txtSeeMore')}</Text>
				</View>
			</View>

			<BottomInset />
		</Page>
	)
}
