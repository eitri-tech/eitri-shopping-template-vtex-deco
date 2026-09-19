import { addDaysToDate, formatAmountInCents, formatDate } from './utils'
import type { VtexAddress, VtexCart, VtexLogisticsInfo, VtexPickupStoreInfo, VtexSla } from '../types/vtex'

interface PreProcessedSla extends VtexSla {
	formattedShippingEstimate?: string
	courierId?: string
	warehouseId?: string
	dockId?: string
	courierName?: string
	isFaster?: boolean
	isCheaper?: boolean
}

interface PreProcessedLogisticInfo {
	itemIndex: number
	selectedSla?: string
	selectedDeliveryChannel?: string
	slas: PreProcessedSla[]
}

interface IndexedSla extends PreProcessedSla {
	itemIndex: number
}

interface PickUpInPoint {
	id?: string
	price?: number
	shippingEstimate?: string
	shippingEstimateDate?: string
	formattedShippingEstimate?: string
	pickupStoreInfo?: VtexPickupStoreInfo
	slas: IndexedSla[]
}

interface ShippingOption {
	label?: string
	shippingEstimate: string
	price: string
	slas: PreProcessedSla[] | IndexedSla[]
	isCurrent: boolean
	isPickupInPoint?: boolean
	pickUpAddress?: string
	address?: Partial<VtexAddress>
	formatedPickAddress?: string
}

export interface CartShippingResolverResult {
	postalCode?: string
	shippingAvailable: boolean
	selectedAddresses?: VtexAddress[]
	address?: VtexAddress
	options: ShippingOption[]
}

export default function cartShippingResolver(cart: VtexCart): CartShippingResolverResult | null {
	try {
		if (!cart?.shippingData?.logisticsInfo) {
			return null
		}

		const logisticsInfo = cart.shippingData?.logisticsInfo

		const preProcessedLogisticInfos = preProcessingSla(logisticsInfo)

		const logInfoWithFasterAndCheaperSla = mapFasterAndCheaperShippingOption(preProcessedLogisticInfos)

		const { cheapers, fasters } = getCheapersAndFasters(logInfoWithFasterAndCheaperSla)

		const pickUpInPoints = getPickupPoints(logInfoWithFasterAndCheaperSla)

		const isCheaperAndFasterTheSame = cheapers.length > 0 && cheapers.every(cheaper => cheaper.isFaster)

		const selectedAddresses = cart.shippingData?.selectedAddresses

		const options: ShippingOption[] = []

		if (cheapers.length > 0 || fasters.length > 0 || pickUpInPoints.length > 0) {
			if (isCheaperAndFasterTheSame) {
				options.push({
					label: 'Entrega econômica',
					shippingEstimate:
						getMaximumDeliveryDate(cheapers) === '01/02/1970'
							? 'Indiponível para entrega'
							: `Receba até ${getMaximumDeliveryDate(cheapers)}`,
					price: getFormattedTotalPrice(cheapers),
					slas: cheapers,
					isCurrent: cheapers.every(cheaper => cheaper.selected)
				})
			} else {
				if (fasters && fasters?.length > 0) {
					options.push({
						label: 'Entrega mais rápida',
						shippingEstimate:
							getMaximumDeliveryDate(fasters) === '01/02/1970'
								? 'Indiponível para entrega'
								: `Receba até ${getMaximumDeliveryDate(fasters)}`,
						price: getFormattedTotalPrice(fasters),
						slas: fasters,
						isCurrent: fasters.every(faster => faster.selected)
					})
				}
				if (cheapers && cheapers?.length > 0) {
					options.push({
						label: 'Entrega econômica',
						shippingEstimate:
							getMaximumDeliveryDate(cheapers) === '01/02/1970'
								? 'Indiponível para entrega'
								: `Receba até ${getMaximumDeliveryDate(cheapers)}`,
						price: getFormattedTotalPrice(cheapers),
						slas: cheapers,
						isCurrent: cheapers.every(cheaper => cheaper.selected)
					})
				}
			}
		}

		if (pickUpInPoints && pickUpInPoints?.length > 0) {
			for (const pickUpInPoint of pickUpInPoints) {
				const pickUpInPointAddress = pickUpInPoint?.pickupStoreInfo?.address
				options.push({
					label: pickUpInPoint?.pickupStoreInfo?.friendlyName,
					shippingEstimate: `Retire na loja até ${pickUpInPoint.formattedShippingEstimate}`,
					price: getFormattedTotalPrice(pickUpInPoint?.slas),
					slas: pickUpInPoint?.slas,
					isPickupInPoint: true,
					pickUpAddress: pickUpInPoint?.pickupStoreInfo?.friendlyName,
					address: { ...pickUpInPointAddress },
					formatedPickAddress: `${pickUpInPointAddress?.street}, ${pickUpInPointAddress?.number} - ${pickUpInPointAddress?.neighborhood} - ${pickUpInPointAddress?.city}`,
					isCurrent: pickUpInPoint?.slas.every(_pickUpInPoint => _pickUpInPoint.selected)
				})
			}
		}

		const shipping: CartShippingResolverResult = {
			postalCode: cart.shippingData?.address?.postalCode,
			shippingAvailable: !(cheapers.length === 0 && fasters.length === 0 && pickUpInPoints.length === 0),
			selectedAddresses,
			address: cart.shippingData?.address,
			options
		}

		return shipping
	} catch (error) {
		console.error('Error on cartShippingResolver', error)

		throw error
	}
}

function getCheapersAndFasters(logInfoWithFasterAndCheaperSla: PreProcessedLogisticInfo[]): {
	cheapers: IndexedSla[]
	fasters: IndexedSla[]
} {
	const cheapers: IndexedSla[] = []
	const fasters: IndexedSla[] = []

	for (const logicInfo of logInfoWithFasterAndCheaperSla) {
		const fasterSla = logicInfo?.slas.find(sla => sla.isFaster)
		const cheaperSla = logicInfo?.slas.find(sla => sla.isCheaper)

		if (cheaperSla) {
			cheapers.push({ itemIndex: logicInfo.itemIndex, ...cheaperSla })
		}
		if (fasterSla) {
			fasters.push({ itemIndex: logicInfo.itemIndex, ...fasterSla })
		}
	}
	return { cheapers, fasters }
}

function getPickupPoints(logInfoWithFasterAndCheaperSla: PreProcessedLogisticInfo[]): PickUpInPoint[] {
	const baseLogisticInfo = logInfoWithFasterAndCheaperSla[0]
	const basePickUpInPoints = baseLogisticInfo?.slas?.filter(sla => sla.isPickupInPoint)

	if (!basePickUpInPoints) return []

	const pickUpInPoints: PickUpInPoint[] = []

	const findSlasFromPickUpInPoints = (pickUpPointId?: string): IndexedSla[] => {
		return logInfoWithFasterAndCheaperSla.reduce<IndexedSla[]>((acc, logicInfo) => {
			const sla = logicInfo?.slas?.find(sla => sla.id === pickUpPointId)
			if (sla) acc.push({ itemIndex: logicInfo.itemIndex, ...sla })
			return acc
		}, [])
	}

	for (const base of basePickUpInPoints) {
		pickUpInPoints.push({
			id: base.id,
			price: base.price,
			shippingEstimate: base.shippingEstimate,
			shippingEstimateDate: base.shippingEstimateDate,
			formattedShippingEstimate: base.formattedShippingEstimate,
			pickupStoreInfo: { ...base.pickupStoreInfo },
			slas: findSlasFromPickUpInPoints(base.id)
		})
	}

	return pickUpInPoints
}

function getFormattedTotalPrice(slas?: Array<{ price?: number }>): string {
	const total = (slas ?? []).reduce((acc, current) => {
		return acc + (current.price ?? 0)
	}, 0)

	return total === 0 ? 'Grátis' : formatAmountInCents(total)
}

function getMaximumDeliveryDate(slas: Array<{ shippingEstimateDate?: string }>): string {
	const maximumDate = slas.reduce<Date | string>((acc, current) => {
		return acc > (current.shippingEstimateDate ?? '') ? acc : (current.shippingEstimateDate ?? '')
	}, new Date(1970, 1, 1))

	return formatDate(maximumDate)
}

function preProcessingSla(logisticsInfo: VtexLogisticsInfo[]): PreProcessedLogisticInfo[] {
	const shippingEstimateDate = (shippingEstimate?: string): Date => {
		// shippingEstimate can be missing on some delivery channels; without the fallback this
		// throws instead of just resolving the pickup/delivery date as "today".
		const safeEstimate = shippingEstimate ?? ''
		const useBd = safeEstimate.indexOf('bd') > -1
		const days = parseInt(safeEstimate)

		return addDaysToDate(days, useBd)
	}

	const hasValidSlas = logisticsInfo.every(logistic => (logistic?.slas ?? []).length > 0)

	if (!hasValidSlas) {
		return []
	}

	return logisticsInfo.map(logistic => {
		return {
			itemIndex: logistic.itemIndex,
			selectedSla: logistic.selectedSla,
			selectedDeliveryChannel: logistic.selectedDeliveryChannel,
			slas: logistic.slas.map(sla => {
				const estimatedDate = shippingEstimateDate(sla.shippingEstimate)
				return {
					id: sla.id,
					price: sla.price,
					shippingEstimate: sla.shippingEstimate,
					shippingEstimateDate: estimatedDate.toISOString(),
					formattedShippingEstimate: formatDate(estimatedDate),
					deliveryChannel: sla.deliveryChannel,
					pickupStoreInfo: sla.pickupStoreInfo,
					selected:
						sla.id === logistic.selectedSla && sla.deliveryChannel === logistic.selectedDeliveryChannel,
					courierId: sla.deliveryIds?.[0]?.courierId,
					warehouseId: sla.deliveryIds?.[0]?.warehouseId,
					dockId: sla.deliveryIds?.[0]?.dockId,
					courierName: sla.deliveryIds?.[0]?.courierName,
					isPickupInPoint: sla.deliveryChannel === 'pickup-in-point'
				}
			})
		}
	})
}

function mapFasterAndCheaperShippingOption(preProcessedSlas: PreProcessedLogisticInfo[]): PreProcessedLogisticInfo[] {
	const _preProcessedSlas: PreProcessedLogisticInfo[] = []

	for (const preProcessedSla of preProcessedSlas) {
		const { slas } = preProcessedSla

		let fasterSla: PreProcessedSla = { shippingEstimateDate: new Date(2199, 1, 1).toISOString(), price: Infinity } as PreProcessedSla
		let cheaperSla: PreProcessedSla = { shippingEstimateDate: new Date(2199, 1, 1).toISOString(), price: Infinity } as PreProcessedSla

		// Considera que para a comparação de datas, o horário é sempre o mesmo. Isso pq a data a formatada assim no utils.js
		for (const sla of slas) {
			if (sla.isPickupInPoint) {
				continue
			}
			if (
				(fasterSla.shippingEstimateDate ?? '') > (sla.shippingEstimateDate ?? '') ||
				(fasterSla.shippingEstimateDate === sla.shippingEstimateDate && fasterSla.price > sla.price)
			) {
				fasterSla = sla
			}
			if (
				cheaperSla.price > sla.price ||
				(cheaperSla.price === sla.price && (cheaperSla.shippingEstimateDate ?? '') > (sla.shippingEstimateDate ?? ''))
			) {
				cheaperSla = sla
			}
		}
		_preProcessedSlas.push({
			...preProcessedSla,
			slas: preProcessedSla?.slas.map(sla => {
				return {
					...sla,
					isFaster: sla.id === fasterSla.id && sla.deliveryChannel === fasterSla.deliveryChannel,
					isCheaper: sla.id === cheaperSla.id && sla.deliveryChannel === cheaperSla.deliveryChannel
				}
			})
		})
	}

	return _preProcessedSlas
}
