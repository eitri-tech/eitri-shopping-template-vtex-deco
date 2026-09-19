import { useEffect, useState } from 'react'
import { useTranslation } from 'eitri-i18n'
import { Page, Text, View, Image } from 'eitri-luminus'
import { useLocalShoppingCart } from '../providers/LocalCart'
import { navigate } from '../services/navigationService'
import { productGroupShippingResolver, GenericBox } from 'eitri-shopping-template-vtex-deco-shared'
import type { EnrichedProductGroup } from 'eitri-shopping-template-vtex-deco-shared'
import FixedBottom from '../components/FixedBottom/FixedBottom'
import {
	HeaderContentWrapper,
	HeaderReturn,
	CustomButton,
	Loading,
	TrackingService,
	ChevronRightIcon
} from 'eitri-shopping-template-vtex-deco-shared'
import type { VtexAddress } from '../types/vtex'

type ShippingGroupSla = EnrichedProductGroup['slas'][number]
type ShippingGroupItem = EnrichedProductGroup['items'][number]

interface DeliveryGroupCardProps {
	index: number
	total: number
	sla: ShippingGroupSla
	items?: ShippingGroupItem[]
}

function DeliveryGroupCard(props: DeliveryGroupCardProps) {
	const { index, total, sla, items } = props

	const formatAddress = (address?: VtexAddress | null) => {
		return `${address?.street ?? ''}, ${address?.number || ''} ${address?.complement || ''} - ${address?.neighborhood ?? ''}`
	}

	const title = sla?.isPickupInPoint
		? `Retire na loja ${sla?.pickupStoreInfo?.friendlyName}`
		: sla?.formatedShippingEstimate

	return (
		<View className='flex flex-col gap-3'>
			<Text className='text-xs font-bold uppercase tracking-wide text-gray-500'>{`Entrega ${index} de ${total}`}</Text>

			<Text className='font-bold text-lg block'>{title}</Text>

			<View className='flex flex-col gap-3'>
				{(items ?? []).map((product, itemIndex) => (
					<View
						key={product?.imageUrl ?? itemIndex}
						className='flex flex-row items-start gap-3'>
						<View className='min-w-12 max-w-12'>
							<Image
								src={product.imageUrl ?? ''}
								width='100%'
								height='100%'
								className='object-cover'
							/>
						</View>
						<Text className='text-sm'>{product.name}</Text>
					</View>
				))}
			</View>

			<Text className='text text-neutral-700'>
				{sla?.pickupStoreInfo?.isPickupStore
					? formatAddress(sla.pickupStoreInfo.address)
					: formatAddress(sla.deliveryAddress)}
			</Text>

			<Text className={`font-semibold ${sla?.formattedTotalPrice === 'Grátis' ? 'text-green-600' : ''}`}>
				{sla?.formattedTotalPrice}
			</Text>
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

	const totalGroups = shippingOptions?.length || 0
	const allResolved = totalGroups > 0 && (shippingOptions ?? []).every(opt => opt.currentSla)

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
				<View className='flex flex-col gap-1'>
					<Text className='text-2xl font-bold'>
						{allResolved
							? `Seu pedido chegará em ${totalGroups} ${totalGroups === 1 ? 'entrega' : 'entregas separadas'}`
							: 'Como deseja receber seu produto?'}
					</Text>
					{allResolved && (
						<Text className='text-sm text-gray-500'>
							Cada item segue um prazo, conforme os detalhes abaixo.
						</Text>
					)}
				</View>

				<View className={'flex flex-col gap-4'}>
					{shippingOptions?.map((group, index) => {
						const currentSla = getCurrentSla(group.slas, group.currentSla)

						return (
							<GenericBox
								key={index}
								className='p-4 w-full rounded-xl border border-gray-100 flex flex-col gap-4'>
								{currentSla ? (
									<DeliveryGroupCard
										index={index + 1}
										total={totalGroups}
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
											<ChevronRightIcon className='text-primary w-[24px]' />
										</View>
									</View>
								)}

								{currentSla && group.slas.length > 1 && (
									<View onClick={() => navigate('FreightGroupSelectorOptions', { group })}>
										<Text className='text-primary font-bold underline'>
											{'Ver outras opções de entrega para este item >'}
										</Text>
									</View>
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
