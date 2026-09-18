import { useEffect, useState } from 'react'
import { useTranslation } from 'eitri-i18n'
import { Page, Text, View, Image } from 'eitri-luminus'
import { useLocalShoppingCart } from '../providers/LocalCart'
import { navigate } from '../services/navigationService'
import { productGroupShippingResolver, GenericBox } from 'eitri-shopping-template-vtex-deco-shared'
import type { EnrichedProductGroup } from 'eitri-shopping-template-vtex-deco-shared'
import FixedBottom from '../components/FixedBottom/FixedBottom'
import { HeaderContentWrapper, HeaderReturn, CustomButton, Loading, TrackingService } from 'eitri-shopping-template-vtex-deco-shared'
import { FaChevronRight } from 'react-icons/fa'
import type { VtexAddress } from '../types/vtex'

type ShippingGroupSla = EnrichedProductGroup['slas'][number]
type ShippingGroupItem = EnrichedProductGroup['items'][number]

interface AddressSelectorCardProps {
	sla: ShippingGroupSla
	items?: ShippingGroupItem[]
}

function AddressSelectorCard(props: AddressSelectorCardProps) {
	const { sla, items } = props

	const formatAddress = (address?: VtexAddress | null) => {
		return `${address?.street ?? ''}, ${address?.number || ''} ${address?.complement || ''} - ${address?.neighborhood ?? ''}`
	}

	return (
		<View className='flex flex-row items-start w-full gap-3'>
			<View className='flex flex-col w-full gap-1'>
				<View className='flex flex-col gap-4 mb-3'>
					{items?.map((product, index) => (
						<View
							key={index}
							className={'flex flex-row items-start gap-3'}>
							<View className='min-w-12 max-w-12'>
								<Image
									src={product.imageUrl ?? ''}
									width='100%'
									height='100%'
									className='object-cover'
								/>
							</View>
							<View className={'text-sm'}>{product.name}</View>
						</View>
					))}
				</View>

				{sla.isPickupInPoint && (
					<View className='bg-primary px-2 py-1 rounded-full w-fit flex items-center justify-center'>
						<Text className='text-xs text-primary-content'>{sla?.formatedShippingEstimate}</Text>
					</View>
				)}

				<Text className='text text-neutral-700'>
					{sla?.pickupStoreInfo?.address ? formatAddress(sla.pickupStoreInfo.address) : formatAddress(sla.deliveryAddress)}
				</Text>

				<View className='flex items-center'>
					<Text className={`font-semibold ${sla.formattedTotalPrice === 'Grátis' ? 'text-green-600' : ''}`}>
						{sla?.formattedTotalPrice}
					</Text>
				</View>
			</View>
		</View>
	)
}

export default function MultipleFreightSelector() {
	const { cart } = useLocalShoppingCart()

	const [isLoading, setIsLoading] = useState(false)

	const { t } = useTranslation()

	useEffect(() => {
		TrackingService.sendScreenView('Seleção de frete múltiplo', 'MultipleFreightSelector')
	}, [])

	const submit = async () => {
		navigate('PaymentData', {}, true)
	}

	const shippingOptions = cart ? productGroupShippingResolver(cart) : null

	const getCurrentSla = (slas: ShippingGroupSla[], currentSla: string) => {
		return slas.find(sla => sla.id === currentSla)
	}

	return (
		<Page title='Seleção de frete múltiplo'>
			<HeaderContentWrapper>
				<HeaderReturn />
			</HeaderContentWrapper>

			<Loading
				fullScreen
				isLoading={isLoading}
			/>

			<View className='flex-1 flex flex-col p-4 gap-4'>
				<Text className='text-xl font-bold'>Como deseja receber seu produto?</Text>

				<View className={'flex flex-col gap-4'}>
					{shippingOptions?.map((group, index) => {
						const currentSla = getCurrentSla(group.slas, group.currentSla)

						const label = currentSla?.isPickupInPoint
							? `Retire na loja ${currentSla?.pickupStoreInfo?.friendlyName ?? ''}`
							: `${currentSla?.formatedShippingEstimate ?? ''}`

						return (
							<GenericBox
								key={index}
								className='p-4 w-full flex flex-col'>
								<View className='flex flex-row items-center justify-between pb-3 mb-3 border-b'>
									<Text className='font-bold'>{`${currentSla ? label : `Escolha a entrega`}`}</Text>
								</View>

								{currentSla ? (
									<AddressSelectorCard
										sla={currentSla}
										items={group?.items}
									/>
								) : (
									<View
										onClick={() => navigate('FreightGroupSelectorOptions', { group })}
										className='flex flex-col'>
										<View className='flex flex-row items-center justify-between mb-1 gap-2'>
											<Text className='font-bold text-lg block'>
												{`Escolha como receber ${group?.items?.length === 1 ? 'seu produto' : 'seus produtos'}`}
											</Text>
											<FaChevronRight className='text-primary w-[24px]' />
										</View>
									</View>
								)}

								{currentSla && group.slas.length > 1 && (
									<>
										<View className='border-b my-4'></View>

										<View onClick={() => navigate('FreightGroupSelectorOptions', { group })}>
											<Text className='text-primary font-bold'>Veja outras opções</Text>
										</View>
									</>
								)}
							</GenericBox>
						)
					})}
				</View>
			</View>

			<FixedBottom
				className='flex flex-col align-center gap-4'
				offSetHeight={120}>
				<CustomButton
					disabled={!shippingOptions?.every(opt => opt.currentSla)}
					label={t('addNewShippingAddress.labelButton')}
					onClick={submit}
				/>
				<View onClick={() => navigate('AddressSelector', {}, true)}>
					<Text className='text-primary text-center font-bold block'>{'Alterar endereço de entrega'}</Text>
				</View>
			</FixedBottom>
		</Page>
	)
}
