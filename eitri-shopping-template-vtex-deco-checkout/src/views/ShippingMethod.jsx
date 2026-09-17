import { HeaderContentWrapper, HeaderReturn, shippingResolver, Loading, TrackingService } from 'eitri-shopping-template-vtex-deco-shared'
import { useLocalShoppingCart } from '../providers/LocalCart'
import { navigate } from '../services/navigationService'
import CardSelector from '../components/CardSelector/CardSelector'

export default function ShippingMethod(props) {
	const { cart, setFreight } = useLocalShoppingCart()

	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		TrackingService.sendScreenView('Método de entrega', 'ShippingMethod')
	}, [])

	const shippingOptions = shippingResolver(cart)

	const goToFreightSelector = () => {
		navigate('FreightSelector', {}, false)
	}

	const goToAddressSelector = () => {
		navigate('AddressSelector', {}, false)
	}

	const onSelectFreightOption = async freightOption => {
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
				selectedAddresses: cart.shippingData.selectedAddresses
			}

			await setFreight(payload)
			navigate('PaymentData')
		} catch (error) {
			console.error('Error on select freight option', error)
		} finally {
			setIsLoading(false)
		}
	}

	const pickUpOptions = shippingOptions?.options?.filter(opt => opt.isPickupInPoint)
	const deliveryOptions = shippingOptions?.options?.filter(opt => !opt.isPickupInPoint)

	const currentOrFirstPickUpOption = pickUpOptions?.find(p => p.isCurrent) || pickUpOptions?.[0]

	const userAddress = cart?.shippingData?.address

	return (
		<Page title='Método de entrega'>
			<HeaderContentWrapper>
				<HeaderReturn />
			</HeaderContentWrapper>

			<Loading
				fullScreen={true}
				isLoading={isLoading}
			/>

			<View className='p-4'>
				{deliveryOptions?.length > 0 && (
					<View>
						<Text className='text-xl font-bold mb-4'>Como você prefere receber seu produto?</Text>
						<CardSelector
							mainTitle={'Enviar para o meu endereço'}
							mainClickHandler={goToFreightSelector}
							secondaryActionHandler={goToAddressSelector}
							secondaryActionTitle={'Trocar endereço de entrega'}>
							<Text className='text text-base-content/70'>{`${userAddress.street}, ${userAddress.number || ''} ${userAddress.complement || ''}`}</Text>
							<Text className='text text-base-content/70'>{`${userAddress.neighborhood} - ${userAddress.city} - ${userAddress.state}`}</Text>
							<Text className='text text-base-content/70'>{`CEP: ${userAddress.postalCode}`}</Text>
						</CardSelector>
					</View>
				)}

				{currentOrFirstPickUpOption && (
					<View className={'mt-4'}>
						<Text className='text-xl font-bold mb-2'>Onde você prefere retirar seu produto?</Text>
						<CardSelector
							mainTitle={`Retirar em ${currentOrFirstPickUpOption?.pickupStoreInfo?.friendlyName}`}
							mainClickHandler={() => onSelectFreightOption(currentOrFirstPickUpOption)}
							secondaryActionHandler={() => navigate('PickupSelector')}
							secondaryActionTitle={'Retirar em outra loja'}>
							<Text className='text text-base-content/70'>{`${currentOrFirstPickUpOption.pickupStoreInfo.address.street}, ${currentOrFirstPickUpOption.pickupStoreInfo.address.number} ${currentOrFirstPickUpOption.pickupStoreInfo.address.complement}`}</Text>
							<Text className='text text-base-content/70'>{`${currentOrFirstPickUpOption.pickupStoreInfo.address.neighborhood} - ${currentOrFirstPickUpOption.pickupStoreInfo.address.city} - ${currentOrFirstPickUpOption.pickupStoreInfo.address.state}`}</Text>
							<Text className='text text-base-content/70'>{`CEP: ${currentOrFirstPickUpOption.pickupStoreInfo.address.postalCode}`}</Text>
							<View className={'flex justify-between items-center w-full'}>
								{currentOrFirstPickUpOption.isPickupInPoint && (
									<View className='bg-primary px-2 py-1 rounded-full w-fit flex items-center justify-center mt-2'>
										<Text className='text-xs text-primary-content'>
											{currentOrFirstPickUpOption?.formattedShippingEstimate}
										</Text>
									</View>
								)}
								<Text className='text text-base-content/70 font-bold'>{`${currentOrFirstPickUpOption.formatedPrice}`}</Text>
							</View>
						</CardSelector>
					</View>
				)}
			</View>
		</Page>
	)
}
