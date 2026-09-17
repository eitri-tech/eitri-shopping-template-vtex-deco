import { useLocalShoppingCart } from '../providers/LocalCart'
import { useTranslation } from 'eitri-i18n'
import { Page, Radio, Text, View } from 'eitri-luminus'
import { navigate } from '../services/navigationService'
import { useState } from 'react'
import { HeaderContentWrapper, HeaderReturn, BottomInset, Loading, TrackingService } from 'eitri-shopping-template-vtex-deco-shared'
import CardSelector from '../components/CardSelector/CardSelector'
import Eitri from 'eitri-bifrost'

export default function FreightGroupSelectorOptions(props) {
	const group = props?.location?.state?.group

	const { cart, setFreight } = useLocalShoppingCart()

	const [isLoading, setIsLoading] = useState(false)

	const { t } = useTranslation()

	useEffect(() => {
		TrackingService.sendScreenView('Opções de frete por grupo', 'FreightGroupSelectorOptions')
	}, [])

	const submit = async () => {
		navigate('PaymentData', {}, true)
	}

	const onSelectFreightOption = async (selectedSla, items) => {
		try {
			setIsLoading(true)
			const slas = items.map(item => ({
				itemIndex: item.itemIndex,
				selectedSla: selectedSla.id,
				selectedDeliveryChannel: selectedSla.isPickupInPoint ? 'pickup-in-point' : 'delivery'
			}))

			const payload = {
				clearAddressIfPostalCodeNotFound: false,
				logisticsInfo: slas,
				selectedAddresses: cart.shippingData.selectedAddresses
			}

			await setFreight(payload)

			Eitri.navigation.back()
		} catch (error) {
			console.error('Error on select freight option', error)
		} finally {
			setIsLoading(false)
		}
	}

	const getAddress = sla => {
		if (sla.isPickupInPoint) {
			return sla.pickupStoreInfo.address
		} else {
			return sla.deliveryAddress
		}
	}

	return (
		<Page title='Opções de frete por grupo'>
			<HeaderContentWrapper>
				<HeaderReturn />
			</HeaderContentWrapper>

			<Loading
				fullScreen
				isLoading={isLoading}
			/>

			<View className='flex-1 flex flex-col p-4 gap-4'>
				<Text className='text-xl font-bold'>{t('freightGroupSelector.txtTitle')}</Text>

				<View className='flex flex-col gap-4'>
					{group?.items?.map(product => (
						<View className={'flex flex-row items-start gap-3'}>
							<Image
								src={product.imageUrl}
								className='w-10 object-contain'
							/>
							<View className='flex flex-col gap-1'>{product.name}</View>
						</View>
					))}
				</View>
				<View className='flex flex-col'>
					{group?.slas?.map(sla => {
						const label = sla.isPickupInPoint
							? t('freightGroupSelector.txtPickup', { name: sla.pickupStoreInfo.friendlyName })
							: t('freightGroupSelector.txtDelivery')

						const address = getAddress(sla)

						return (
							<CardSelector
								mainTitle={label}
								mainClickHandler={() => onSelectFreightOption(sla, group.items)}
								secondaryActionTitle={sla.formatedShippingEstimate}>
								<Text className='text text-base-content/70'>{`${address.street}, ${address.number} ${address.complement}`}</Text>
								<Text className='text text-base-content/70'>{`${address.neighborhood} - ${address.city} - ${address.state}`}</Text>
								<Text className='text text-base-content/70'>{`CEP: ${address.postalCode}`}</Text>
								<View className={'mt-2'}>
									<Text
										className={`font-semibold ${sla.formattedTotalPrice === 'Grátis' ? 'text-green-600' : ''}`}>
										{sla.formattedTotalPrice}
									</Text>
								</View>
							</CardSelector>
						)
					})}
				</View>
			</View>

			<BottomInset />
		</Page>
	)
}
