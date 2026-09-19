import { useEffect, useState } from 'react'
import { Page, Text, View } from 'eitri-luminus'
import { useLocalShoppingCart } from '../providers/LocalCart'
import { useTranslation } from 'eitri-i18n'
import { navigate } from '../services/navigationService'
import FixedBottom from '../components/FixedBottom/FixedBottom'
import CardSelector from '../components/CardSelector/CardSelector'
import {
	HeaderContentWrapper,
	HeaderReturn,
	HeaderText,
	BottomInset,
	Loading,
	TrackingService
} from 'eitri-shopping-template-vtex-deco-shared'
import OtpLogin from '../components/OtpLogin/OtpLogin'
import type { VtexAddress } from '../types/vtex'

export default function AddressSelector() {
	const { cart, setShippingAddress } = useLocalShoppingCart()
	const { t } = useTranslation()

	const [isAddressLoading, setIsAddressLoading] = useState(false)

	const [modalLogin, setModalLogin] = useState(false)
	const [currentEditingAddress, setCurrentEditingAddress] = useState<VtexAddress | null>(null)

	const PAGE = 'Checkout - Seleção de Endereço'

	useEffect(() => {
		if ((cart?.shippingData?.availableAddresses?.length ?? 0) > 0) {
			TrackingService.sendScreenView('Seleção de endereço', 'AddressSelector')
		} else {
			handleAddNewAddress()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleAddressSelect = async (address: VtexAddress) => {
		setIsAddressLoading(true)
		try {
			const currentAddress = cart?.shippingData?.address
			if (currentAddress?.addressId !== address?.addressId) {
				await setShippingAddress?.(address)
			}

			navigate('FreightResolver')
		} catch (error) {
			console.error('Error selecting address:', error)
		} finally {
			setIsAddressLoading(false)
		}
	}

	const handleAddNewAddress = () => {
		navigate('AddressForm', {}, true)
	}

	const getAddresses = (): VtexAddress[] => {
		if (cart?.shippingData?.availableAddresses) {
			return cart.shippingData.availableAddresses
				.filter(a => a.addressType === 'residential')
				.map(address => {
					return {
						...address
					}
				})
				.sort((a, b) => {
					return (a.street ?? '') > (b.street ?? '') ? 1 : -1
				})
		}
		return []
	}

	const handleEditAddress = (address: VtexAddress | null) => {
		if (!address) return
		if (!cart?.canEditData) {
			setModalLogin(true)
			setCurrentEditingAddress(address)
			return
		}
		navigate('AddressForm', { addressId: address.addressId ?? '' })
	}

	const availableAddresses = getAddresses()

	return (
		<Page title={PAGE}>
			<HeaderContentWrapper>
				<HeaderReturn />
				<HeaderText text={t('addNewShippingAddress.title')} />
			</HeaderContentWrapper>

			<Loading
				fullScreen
				isLoading={isAddressLoading}
			/>

			<View className='flex-1 flex flex-col p-4'>
				<View className={`w-full`}>
					<View className='flex flex-col gap-1 mb-4'>
						<Text className='text-lg font-bold text-base-content'>
							{t('addressSelector.subtitle', 'Selecione um endereço para entrega')}
						</Text>
					</View>

					{availableAddresses?.map(address => (
						<CardSelector
							key={address.addressId}
							mainTitle={`${address.street ?? ''}, ${address.number || ''} ${address.complement || ''}`}
							mainClickHandler={() => handleAddressSelect(address)}
							secondaryActionHandler={() => handleEditAddress(address)}
							secondaryActionTitle={'Editar'}>
							<Text className='text text-base-content/70'>
								{`${address.neighborhood ?? ''} - ${address.city ?? ''} - ${address.state ?? ''}`}
							</Text>
							<Text className='text text-base-content/70'>{address.postalCode ?? ''}</Text>
						</CardSelector>
					))}
				</View>
			</View>

			<FixedBottom
				className='flex flex-col align-center gap-4'
				offSetHeight={56}>
				<View onClick={handleAddNewAddress}>
					<Text className='text-primary text-center font-bold block'>
						{t('addressSelector.addNewAddress', 'Adicionar Novo Endereço')}
					</Text>
				</View>
			</FixedBottom>

			<OtpLogin
				open={modalLogin}
				onLogged={() => handleEditAddress(currentEditingAddress)}
				onClose={() => setModalLogin(false)}
			/>

			<BottomInset />
		</Page>
	)
}
