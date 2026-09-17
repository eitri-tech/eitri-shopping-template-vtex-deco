import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { View, Text, Image } from 'eitri-luminus'
import { useTranslation } from 'eitri-i18n'
import fetchFreight from '../../services/freightService'
import { CustomButton, CustomInput, GenericBox } from 'eitri-shopping-template-vtex-deco-shared'
import { FiTruck } from 'react-icons/fi'
import { loadPostalCodeFromStorage, savePostalCodeOnStorage } from '../../services/customerService'
import storeFacadeIcon from './../../assets/images/storeFacadeIcon.svg'
import truck from './../../assets/images/truckIcon.svg'
import type { VtexSku } from '../../types/vtex'

interface FreightOption {
	isPickupInPoint?: boolean
	formattedShippingEstimate?: string
	formatedPrice?: string
	price?: number
	[key: string]: unknown
}

interface FreightResult {
	options?: FreightOption[]
	[key: string]: unknown
}

interface FreightProps {
	currentSku?: VtexSku
}

export default function Freight(props: FreightProps) {
	const { currentSku } = props
	const { t } = useTranslation()
	const [pristine, setPristine] = useState(true)
	const [zipCode, setZipCode] = useState('')
	const [freightOptions, setFreightOptions] = useState<FreightResult | null>(null)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		loadPostalCodeFromStorage()
			.then(postalCode => {
				if (postalCode) {
					setZipCode(postalCode)
					handleFreight(postalCode)
				}
			})
			.catch(() => {})
	}, [])

	const onInputZipCode = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setZipCode(value)
	}

	const handleFreight = async (zipCode: string) => {
		if (loading) return
		setLoading(true)
		try {
			let freightOpt = (await fetchFreight(zipCode, currentSku)) as unknown as FreightResult
			setFreightOptions(freightOpt)
			setPristine(false)
			await savePostalCodeOnStorage(zipCode)
		} catch (error) {
			console.error('Error handleFreight', error)
		}
		setLoading(false)
	}

	// TODO Fazer lógica para pegar o melhor
	const betterPickupOption = freightOptions?.options?.find(item => item.isPickupInPoint)
	const betterDeliveryOption = freightOptions?.options?.find(item => !item.isPickupInPoint)

	return (
		<GenericBox className='flex flex-col'>
			<View className='flex items-center w-full gap-2'>
				<FiTruck size={26} />
				<Text className='text-lg font-semibold'>{t('freight.txtCalculate')}</Text>
			</View>
			<View>
				<View className='flex justify-between items-center w-full gap-2 mt-2'>
					<View className='w-2/3'>
						<CustomInput
							placeholder={t('freight.labelZipCode')}
							value={zipCode}
							variant='mask'
							mask='99999-999'
							inputMode='numeric'
							onChange={onInputZipCode}
						/>
					</View>
					<View className='w-1/3'>
						<CustomButton
							label={t('freight.labelCalculate')}
							variant='outlined'
							onClick={() => handleFreight(zipCode)}
						/>
					</View>
				</View>

				{loading && <View className={`mt-3 w-full h-[100px] bg-gray-200 rounded animate-pulse`} />}

				{!loading && (
					<View className='flex flex-col w-full items-center justify-between gap-2 mt-4'>
						{betterPickupOption && (
							<View className={'flex justify-between w-full'}>
								<View className={'flex gap-2 grow'}>
									<Image
										src={storeFacadeIcon}
										width={25}
									/>
									<Text className=''>{betterPickupOption?.formattedShippingEstimate}</Text>
								</View>
								<Text className={`${betterPickupOption.price === 0 ? 'text-accent' : ''} font-bold`}>
									{betterPickupOption?.formatedPrice}
								</Text>
							</View>
						)}

						{betterDeliveryOption && (
							<View className={'flex justify-between w-full'}>
								<View className={'flex gap-2 grow'}>
									<Image
										src={truck}
										width={25}
									/>
									<Text className=''>{betterDeliveryOption?.formattedShippingEstimate}</Text>
								</View>
								<Text className={`${betterDeliveryOption.price === 0 ? 'text-accent' : ''} font-bold`}>
									{betterDeliveryOption?.formatedPrice}
								</Text>
							</View>
						)}
						{!betterPickupOption && !betterDeliveryOption && !pristine && (
							<View className='w-full rounded-lg bg-[#FEFAE2] px-4 py-3'>
								<View className='flex flex-row items-center gap-2'>
									<Text className='flex-1 text-sm leading-5 text-gray-800'>
										{t('freight.errorUnavailable')}
									</Text>
								</View>
							</View>
						)}
					</View>
				)}
			</View>
		</GenericBox>
	)
}
