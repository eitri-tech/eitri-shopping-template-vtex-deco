import { useEffect, useState } from 'react'
import { useTranslation } from 'eitri-i18n'
import { Page, Text, View, Image } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import { useLocalShoppingCart } from '../providers/LocalCart'
import { navigate } from '../services/navigationService'
import { HeaderContentWrapper, HeaderReturn, BottomInset, Loading, TrackingService } from 'eitri-shopping-template-vtex-deco-shared'
import type { EnrichedProductGroup } from 'eitri-shopping-template-vtex-deco-shared'
import CardSelector from '../components/CardSelector/CardSelector'
import type { RouteProps } from '../types/route'
import type { VtexAddress } from '../types/vtex'

type ShippingGroupSla = EnrichedProductGroup['slas'][number]
type ShippingGroupItem = EnrichedProductGroup['items'][number]

export default function FreightGroupSelectorOptions(props: RouteProps<{ group?: EnrichedProductGroup }>) {
	const group = props?.location?.state?.group

	const { cart, setFreight } = useLocalShoppingCart()

	const [isLoading, setIsLoading] = useState(false)

	const { t } = useTranslation()

	useEffect(() => {
		TrackingService.sendScreenView('Opções de frete por grupo', 'FreightGroupSelectorOptions')
	}, [])

	const onSelectFreightOption = async (selectedSla: ShippingGroupSla, items: ShippingGroupItem[]) => {
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
				selectedAddresses: cart?.shippingData?.selectedAddresses
			}

			await setFreight?.(payload)

			Eitri.navigation.back(1)
		} catch (error) {
			console.error('Error on select freight option', error)
		} finally {
			setIsLoading(false)
		}
	}

	const getAddress = (sla: ShippingGroupSla): VtexAddress | null => {
		if (sla.isPickupInPoint) {
			return sla.pickupStoreInfo?.address ?? null
		}
		return sla.deliveryAddress
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
					{group?.items?.map((product, index) => (
						<View
							key={index}
							className={'flex flex-row items-start gap-3'}>
							<Image
								src={product.imageUrl ?? ''}
								className='w-10 object-contain rounded'
							/>
							<View className='flex flex-col gap-1'>{product.name}</View>
						</View>
					))}
				</View>
				<View className='flex flex-col'>
					{group?.slas?.map(sla => {
						const label = sla.isPickupInPoint
							? t('freightGroupSelector.txtPickup', { name: sla.pickupStoreInfo?.friendlyName ?? '' })
							: t('freightGroupSelector.txtDelivery')

						const address = getAddress(sla)

						return (
							<CardSelector
								key={sla.id}
								mainTitle={label}
								mainClickHandler={() => onSelectFreightOption(sla, group.items)}
								secondaryActionTitle={sla.formatedShippingEstimate}>
								<Text className='text text-base-content/70'>{`${address?.street ?? ''}, ${address?.number ?? ''} ${address?.complement ?? ''}`}</Text>
								<Text className='text text-base-content/70'>{`${address?.neighborhood ?? ''} - ${address?.city ?? ''} - ${address?.state ?? ''}`}</Text>
								<Text className='text text-base-content/70'>{`CEP: ${address?.postalCode ?? ''}`}</Text>
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
