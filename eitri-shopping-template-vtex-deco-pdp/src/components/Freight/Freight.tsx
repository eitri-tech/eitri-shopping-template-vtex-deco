import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { View, Text } from 'eitri-luminus'
import { useTranslation } from 'eitri-i18n'
import Eitri from 'eitri-bifrost'
import fetchFreight from '../../services/freightService'
import { CustomButton, CustomInput, CloseIcon, MinusIcon, PlusIcon } from 'eitri-shopping-template-vtex-deco-shared'
import { loadPostalCodeFromStorage, savePostalCodeOnStorage } from '../../services/customerService'
import type { VtexSku } from '../../types/vtex'

interface FreightOption {
	id?: string
	name?: string
	isPickupInPoint?: boolean
	formattedShippingEstimate?: string
	shippingEstimateDate?: string
	formatedPrice?: string
	price?: number
	pickupDistance?: number | null
	pickupStoreInfo?: {
		friendlyName?: string
		address?: { state?: string; street?: string; [key: string]: unknown }
		[key: string]: unknown
	}
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
	const [resultsVisible, setResultsVisible] = useState(false)
	const [showAllPickupOptions, setShowAllPickupOptions] = useState(false)

	useEffect(() => {
		if (!loading && !pristine) {
			setResultsVisible(false)
			const id = requestAnimationFrame(() => setResultsVisible(true))
			return () => cancelAnimationFrame(id)
		}
		setResultsVisible(false)
	}, [loading, pristine])

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
		setZipCode(e.target.value)
	}

	const clearZipCode = () => {
		setZipCode('')
		setFreightOptions(null)
		setPristine(true)
		setShowAllPickupOptions(false)
	}

	const handleFreight = async (zipCode: string) => {
		if (loading) return
		setLoading(true)
		setShowAllPickupOptions(false)
		try {
			const freightOpt = (await fetchFreight(zipCode, currentSku)) as unknown as FreightResult
			setFreightOptions(freightOpt)
			setPristine(false)
			await savePostalCodeOnStorage(zipCode)
		} catch (error) {
			console.error('Error handleFreight', error)
		}
		setLoading(false)
	}

	const allOptions = freightOptions?.options ?? []
	const deliveryOptions = [...allOptions.filter(o => !o.isPickupInPoint)].sort((a, b) => {
		if (!a.shippingEstimateDate) return 1
		if (!b.shippingEstimateDate) return -1
		return new Date(a.shippingEstimateDate).getTime() - new Date(b.shippingEstimateDate).getTime()
	})
	const pickupOptions = allOptions
		.filter(o => o.isPickupInPoint)
		.sort((a, b) => {
			const distanceA = Number(a.pickupDistance)
			const distanceB = Number(b.pickupDistance)
			const hasDistanceA = a.pickupDistance != null && Number.isFinite(distanceA)
			const hasDistanceB = b.pickupDistance != null && Number.isFinite(distanceB)

			if (!hasDistanceA && !hasDistanceB) return 0
			if (!hasDistanceA) return 1
			if (!hasDistanceB) return -1
			return distanceA - distanceB
		})
	const visiblePickupOptions = showAllPickupOptions ? pickupOptions : pickupOptions.slice(0, 1)
	const hasNoResults = !pristine && allOptions.length === 0

	return (
		<View className='flex flex-col gap-4 p-4 mt-8 w-full bg-[#E8E6DF]'>
			<View className='flex flex-col'>
				<Text className='text-2xl font-semibold'>{t('freight.txtCalculate')}</Text>
				<Text className='text-sm text-gray-500'>{t('freight.txtSubtitle')}</Text>
			</View>

			<View className='flex flex-row gap-2 items-center w-full'>
				<View className='flex-1 relative'>
					<CustomInput
						placeholder={t('freight.labelZipCode')}
						value={zipCode}
						variant='mask'
						mask='99999-999'
						inputMode='numeric'
						onChange={onInputZipCode}
						className={zipCode ? 'pr-10' : ''}
					/>
					{zipCode && (
						<View
							onClick={clearZipCode}
							className='absolute right-3 top-0 bottom-0 flex items-center justify-center'>
							<CloseIcon size={18} />
						</View>
					)}
				</View>
				<View className='w-[120px]'>
					<CustomButton
						label={pristine ? t('freight.labelConsult') : t('freight.labelCalculate')}
						onClick={() => handleFreight(zipCode)}
					/>
				</View>
			</View>

			{pristine && (
				<View
					onClick={() =>
						Eitri.openBrowser({ url: 'https://buscacepinter.correios.com.br/app/endereco/index.php' })
					}>
					<Text className='underline text-sm'>{t('freight.txtNoZipCode')}</Text>
				</View>
			)}

			{loading && <View className='w-full h-[100px] bg-gray-200 rounded animate-pulse' />}

			{!loading && !pristine && (
				<View
					className={`flex flex-col w-full transition-all duration-300 ${
						allOptions.length > 0 ? 'border border-neutral-500' : ''
					} ${resultsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
					{deliveryOptions.length > 0 && (
						<View
							className={`p-4 flex flex-col gap-3 ${pickupOptions.length > 0 ? 'border-b border-neutral-500' : ''}`}>
							<Text className='text-lg'>{t('freight.txtDelivery')}</Text>
							{deliveryOptions.map((option, index) => (
								<View
									key={option.id ?? index}
									className='flex flex-row gap-3'>
									<Text className='text-sm shrink-0 w-[54px]'>{option.formatedPrice ?? ''}</Text>
									<View className='flex flex-col gap-0.5 flex-1'>
										<View className='flex flex-row items-center gap-2 flex-wrap'>
											<Text className='text-sm font-bold'>{option.name ?? ''}</Text>
											{index === 0 && (
												<View className='bg-yellow-400 px-2 py-0.5 rounded'>
													<Text className='text-xs font-semibold'>{t('freight.labelFastest')}</Text>
												</View>
											)}
										</View>
										<Text className='text-xs text-gray-500'>{option.formattedShippingEstimate ?? ''}</Text>
									</View>
								</View>
							))}
						</View>
					)}

					{pickupOptions.length > 0 && (
						<View className='p-4 flex flex-col gap-3'>
							<View className='flex flex-row items-center justify-between'>
								<Text className='text-lg'>{t('freight.txtPickup')}</Text>
								{pickupOptions.length > 1 && (
									<View
										onClick={() => setShowAllPickupOptions(currentValue => !currentValue)}
										className='flex items-center justify-center w-8 h-8'>
										{showAllPickupOptions ? <MinusIcon size={20} /> : <PlusIcon size={20} />}
									</View>
								)}
							</View>
							{visiblePickupOptions.map((option, index) => (
								<View
									key={option.id ?? index}
									className='flex flex-row gap-3'>
									<Text className='text-sm shrink-0 w-[54px]'>{option.formatedPrice ?? ''}</Text>
									<View className='flex flex-col gap-0.5 flex-1'>
										<Text className='text-sm font-bold'>
											{option.pickupStoreInfo?.friendlyName || option.name || ''}
										</Text>
										{option.pickupStoreInfo?.address && (
											<Text className='text-xs text-gray-500'>
												{[option.pickupStoreInfo.address.state, option.pickupStoreInfo.address.street]
													.filter(Boolean)
													.join(' - ')}
											</Text>
										)}
									</View>
								</View>
							))}
						</View>
					)}

					{hasNoResults && (
						<View className='w-full rounded-lg bg-[#FEFAE2] px-4 py-3'>
							<Text className='text-sm leading-5 text-gray-800'>{t('freight.errorUnavailable')}</Text>
						</View>
					)}
				</View>
			)}
		</View>
	)
}
