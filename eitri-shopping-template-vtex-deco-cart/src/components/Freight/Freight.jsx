import { useState } from 'react'
import { View, Text } from 'eitri-luminus'
import { CustomButton, CustomInput } from 'eitri-shopping-template-vtex-deco-shared'
import { useTranslation } from 'eitri-i18n'
import { savePostalCodeOnStorage } from '../../services/customerService'
import { resolveZipCode } from '../../services/freigthService'
import { useLocalShoppingCart } from '../../providers/LocalCart'

export default function Freight() {
	const [zipCode, setZipCode] = useState('')
	const [loading, setLoading] = useState(false)
	const { cart, setLogisticInfo } = useLocalShoppingCart()
	const { t } = useTranslation()

	const unavailableItems = cart?.items?.filter(item => item.availability === 'cannotBeDelivered') || []

	if (unavailableItems.length === 0) return null

	const cartPostalCode = cart?.shippingData?.address?.postalCode

	const handleFreight = async cep => {
		if (loading) return
		setLoading(true)
		try {
			const { street, neighborhood, city, state, country, geoCoordinates } = await resolveZipCode(cep)
			await setLogisticInfo({
				address: {
					addressType: 'residential',
					postalCode: cep,
					street,
					neighborhood,
					city,
					state,
					country,
					geoCoordinates
				},
				clearAddressIfPostalCodeNotFound: true
			})
			await savePostalCodeOnStorage(cep)
		} catch (error) {
			console.error('Error handleFreight', error)
		}
		setLoading(false)
	}

	return (
		<View className='px-4'>
			<View className='bg-[#FEFAE2] border border-yellow-300 p-4 flex flex-col gap-3'>
				<View className='flex flex-col gap-1'>
					<Text className='text-sm font-semibold text-gray-800'>
						{cartPostalCode
							? t('freight.unavailableWithZip', { postalCode: cartPostalCode })
							: t('freight.unavailableGeneral')}
					</Text>
					{unavailableItems.map((item, index) => (
						<Text
							key={index}
							className='text-xs text-gray-600'>
							{'• ' + (item?.name || t('freight.unavailableProduct'))}
						</Text>
					))}
				</View>

				<Text className='text-xs text-gray-600'>{t('freight.txtChangeZip')}</Text>

				<View className='flex flex-row items-center gap-2'>
					<View className='flex-1'>
						<CustomInput
							placeholder='00000-000'
							value={zipCode}
							variant='mask'
							mask='99999-999'
							inputMode='numeric'
							onChange={e => setZipCode(e.target.value)}
						/>
					</View>
					<View className='w-1/3'>
						<CustomButton
							label={t('freight.labelCalculate')}
							variant='outlined'
							isLoading={loading}
							onClick={() => handleFreight(zipCode)}
						/>
					</View>
				</View>
			</View>
		</View>
	)
}
