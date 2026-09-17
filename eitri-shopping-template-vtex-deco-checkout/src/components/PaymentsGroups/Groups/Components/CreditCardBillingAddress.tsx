import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Text, View, Checkbox } from 'eitri-luminus'
import { useLocalShoppingCart } from '../../../../providers/LocalCart'
import { resolvePostalCode } from '../../../../services/freigthService'
import { CustomInput } from 'eitri-shopping-template-vtex-deco-shared'
import type { VtexAddress } from '../../../../types/vtex'

export default function CreditCardBillingAddress() {
	const { cart, cardInfo, setCardInfo } = useLocalShoppingCart()

	const [useShippingAddress, setUseShippingAddress] = useState(true)

	useEffect(() => {
		const userAddress = cart?.shippingData?.address
		if (userAddress && userAddress.addressType === 'residential') {
			setCardInfo?.({ ...cardInfo, address: userAddress })
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleAddressChange = (field: keyof VtexAddress, e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setCardInfo?.(prev => ({
			...prev,
			address: {
				...prev?.address,
				[field]: value
			}
		}))
	}

	const handlePostalCodeChange = async (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value

		if (!/^\d{5}-?\d{3}$/.test(value)) {
			handleAddressChange('postalCode', e)
			return
		}

		try {
			const result = await resolvePostalCode(value)
			const address: VtexAddress = {
				addressId: undefined,
				addressType: undefined,
				city: result.city,
				complement: '',
				country: result.country,
				neighborhood: result.neighborhood,
				number: '',
				postalCode: value,
				reference: '',
				state: result.state,
				street: result.street
			}

			setCardInfo?.({ ...cardInfo, addressId: null, address })
		} catch (e) {
			console.error('Error ao carregar endereço pelo CEP:', e)
		}
	}

	const onChangeBillingAddressCheckbox = (checked: boolean) => {
		setUseShippingAddress(checked)
		if (checked) {
			const userAddress = cart?.shippingData?.address
			if (userAddress) {
				setCardInfo?.({ ...cardInfo, address: null, addressId: userAddress.addressId ?? null })
			}
		} else {
			setCardInfo?.({ ...cardInfo, address: null, addressId: null })
		}
	}

	const getShippingAddressLabel = (): string => {
		if (cardInfo?.address) {
			return `${cardInfo.address.street ?? ''}, ${cardInfo.address.number ?? ''} - ${cardInfo.address.neighborhood ?? ''}, ${cardInfo.address.city ?? ''}`
		}
		return 'endereço de entrega'
	}

	return (
		<View className='flex flex-col gap-2 mt-2'>
			<Text className='text-sm font-bold'>Endereço de cobrança</Text>

			<View className='flex flex-row items-center gap-2'>
				<Checkbox
					id='useShippingAddress'
					className='checkbox-sm w-4 h-4'
					checked={useShippingAddress}
					onChange={(e: ChangeEvent<HTMLInputElement>) => onChangeBillingAddressCheckbox(e.target.checked)}
				/>

				{/* Text has no `htmlFor` prop — clicking the label used to be a no-op; now the row toggles the checkbox. */}
				<Text
					className='text-sm cursor-pointer'
					onClick={() => onChangeBillingAddressCheckbox(!useShippingAddress)}>
					O endereço da fatura é {getShippingAddressLabel()}
				</Text>
			</View>

			{!useShippingAddress && (
				<>
					<CustomInput
						label='CEP'
						value={cardInfo?.address?.postalCode ?? ''}
						inputMode='numeric'
						variant='mask'
						mask='99999-999'
						onChange={handlePostalCodeChange}
					/>

					<CustomInput
						label='Rua'
						value={cardInfo?.address?.street ?? ''}
						onChange={(e: ChangeEvent<HTMLInputElement>) => handleAddressChange('street', e)}
					/>

					<View className='flex flex-row gap-4'>
						<CustomInput
							label='Número'
							value={cardInfo?.address?.number ?? ''}
							onChange={(e: ChangeEvent<HTMLInputElement>) => handleAddressChange('number', e)}
						/>
						<CustomInput
							label='Complemento'
							value={cardInfo?.address?.complement ?? ''}
							onChange={(e: ChangeEvent<HTMLInputElement>) => handleAddressChange('complement', e)}
						/>
					</View>

					<CustomInput
						label='Bairro'
						value={cardInfo?.address?.neighborhood ?? ''}
						onChange={(e: ChangeEvent<HTMLInputElement>) => handleAddressChange('neighborhood', e)}
					/>

					<View className='flex flex-row gap-4'>
						<CustomInput
							label='Cidade'
							value={cardInfo?.address?.city ?? ''}
							onChange={(e: ChangeEvent<HTMLInputElement>) => handleAddressChange('city', e)}
						/>
						<CustomInput
							label='Estado'
							value={cardInfo?.address?.state ?? ''}
							onChange={(e: ChangeEvent<HTMLInputElement>) => handleAddressChange('state', e)}
						/>
					</View>
				</>
			)}
		</View>
	)
}
