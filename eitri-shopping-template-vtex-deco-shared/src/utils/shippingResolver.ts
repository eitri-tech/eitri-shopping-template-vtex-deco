import { formatAmountInCents, formatShippingEstimate, getShippingEstimate } from './utils'
import type { VtexAddress, VtexCart, VtexCartItem, VtexLogisticsInfo, VtexPickupStoreInfo, VtexSla } from '../types/vtex'

// Constantes
const FREE_SHIPPING_LABEL = 'Grátis'
const PICKUP_CHANNEL = 'pickup-in-point'

interface FlattenedSla extends VtexSla {
	itemIndex: number
	addressId?: string
}

interface ProductRef {
	itemIndex: number
	name?: string
	imageUrl?: string
	quantity?: number
}

interface GroupedSla {
	id: string
	name?: string
	addressId?: string
	isPickupInPoint: boolean
	pickupStoreInfo: VtexPickupStoreInfo | null
	pickupPointId?: string
	pickupDistance?: number
	price: number
	formattedShippingEstimate: string
	shippingEstimateDate?: string
	slas: Array<{ itemIndex: number; selectedSla?: string; selectedDeliveryChannel?: string }>
}

interface EnrichedShippingOption extends GroupedSla {
	formatedPrice: string
	fulfillsAllItems: boolean
	deliveryAddress: VtexAddress | null
	businessHours?: unknown
	products: ProductRef[]
}

interface CurrentSla {
	id: string
	name?: string
	isPickupInPoint: boolean
	address: VtexAddress | null
	pickupStoreInfo?: VtexPickupStoreInfo
	price: number
	formattedShippingEstimate: string
	formatedPrice: string
	products: ProductRef[]
}

export interface ShippingResolverResult {
	options: EnrichedShippingOption[]
	current: CurrentSla[]
	addressOk: boolean
}

export default function shippingResolver(cart: VtexCart): ShippingResolverResult | null {
	try {
		if (!cart?.shippingData?.logisticsInfo) {
			return null
		}

		const { logisticsInfo, selectedAddresses, pickupPoints } = cart.shippingData
		const { items } = cart

		const flattenedSlas = flattenSlas(logisticsInfo)
		const groupedSlas = groupSlasByType(flattenedSlas)
		const enrichedOptions = enrichShippingOptions(groupedSlas, items, selectedAddresses, pickupPoints)
		const currentSlas = extractCurrentSlas(logisticsInfo, items, selectedAddresses)
		return {
			options: enrichedOptions,
			current: currentSlas,
			addressOk: logisticsInfo.every(logistic => !!logistic.selectedSla)
		}
	} catch (error) {
		console.error('Error on shippingResolver', error)
		throw error
	}
}

// Helper: Formata preço de forma consistente
function formatPrice(priceInCents: number): string {
	return priceInCents === 0 ? FREE_SHIPPING_LABEL : formatAmountInCents(priceInCents)
}

// Helper: Verifica se é pickup
function isPickupDelivery(deliveryChannel?: string): boolean {
	return deliveryChannel === PICKUP_CHANNEL
}

// Helper: Obtém endereço correto
function getAddress(sla: VtexSla & { addressId?: string }, selectedAddresses?: VtexAddress[]): VtexAddress | null {
	if (isPickupDelivery(sla.deliveryChannel)) {
		return sla.pickupStoreInfo?.address ? { ...sla.pickupStoreInfo.address } : null
	}
	return selectedAddresses?.find(addr => addr.addressId === sla.addressId) || null
}

// Helper: Obtém produto por índice com validação
function getProductData(items: VtexCartItem[], itemIndex: number): Omit<ProductRef, 'itemIndex'> {
	const item = items?.[itemIndex]
	if (!item) {
		console.warn(`Item not found at index ${itemIndex}`)
		return {
			name: 'Unknown Product',
			imageUrl: undefined
		}
	}
	return {
		name: item.name,
		imageUrl: item.imageUrl,
		quantity: item.quantity
	}
}

// 1. Achata todas as SLAs de todos os itens
function flattenSlas(logisticsInfo: VtexLogisticsInfo[]): FlattenedSla[] {
	return logisticsInfo.reduce<FlattenedSla[]>((flattened, logistic) => {
		const slasWithContext =
			logistic.slas?.map(sla => ({
				...sla,
				itemIndex: logistic.itemIndex,
				addressId: logistic.addressId
			})) || []

		return [...flattened, ...slasWithContext]
	}, [])
}

// 2. Agrupa SLAs pelo ID (mesmo tipo de entrega)
function groupSlasByType(allSlas: FlattenedSla[]): GroupedSla[] {
	const grouped = new Map<string, GroupedSla>()

	for (const sla of allSlas) {
		if (grouped.has(sla.id)) {
			const existing = grouped.get(sla.id)!
			existing.price += sla.price
			existing.slas.push({
				itemIndex: sla.itemIndex,
				selectedSla: sla.id,
				selectedDeliveryChannel: sla.deliveryChannel
			})
		} else {
			grouped.set(sla.id, {
				id: sla.id,
				name: sla.name,
				addressId: sla.addressId,
				isPickupInPoint: sla.deliveryChannel === 'pickup-in-point',
				pickupStoreInfo: sla.pickupStoreInfo ? JSON.parse(JSON.stringify(sla.pickupStoreInfo)) : null,
				pickupPointId: sla.pickupPointId,
				pickupDistance: sla.pickupDistance,
				price: sla.price,
				formattedShippingEstimate: formatShippingEstimate(sla),
				shippingEstimateDate: sla.shippingEstimateDate,
				slas: [
					{
						itemIndex: sla.itemIndex,
						selectedSla: sla.id,
						selectedDeliveryChannel: sla.deliveryChannel
					}
				]
			})
		}
	}

	return Array.from(grouped.values())
}

// 3. Enriquece dados com informações completas
function enrichShippingOptions(
	groupedSlas: GroupedSla[],
	items: VtexCartItem[],
	selectedAddresses?: VtexAddress[],
	pickupPoints?: Array<{ id?: string; businessHours?: unknown }>
): EnrichedShippingOption[] {
	return groupedSlas.map(group => {
		let deliveryAddress: VtexAddress | null = !group.isPickupInPoint
			? (() => {
					const address = selectedAddresses?.find(addr => addr.addressId === group.addressId)
					return address ? JSON.parse(JSON.stringify(address)) : null
				})()
			: null

		const pickupPoint = pickupPoints?.find(point => point.id === group.pickupPointId)
		const allItemsCovered = group.slas.length === items.length

		return {
			...group,
			formatedPrice: formatPrice(group.price),
			fulfillsAllItems: allItemsCovered,
			deliveryAddress: deliveryAddress,
			businessHours: pickupPoint?.businessHours,
			products: group.slas.map(slaItem => {
				const productData = getProductData(items, slaItem.itemIndex)
				return {
					itemIndex: slaItem.itemIndex,
					...productData
				}
			})
		}
	})
}

// 4. Extrai SLAs atualmente selecionadas
function extractCurrentSlas(
	logisticsInfo: VtexLogisticsInfo[],
	items: VtexCartItem[],
	selectedAddresses?: VtexAddress[]
): CurrentSla[] {
	const currentSlasMap = new Map<string, CurrentSla>()

	for (const logistic of logisticsInfo) {
		if (!logistic.selectedSla) continue

		const sla = logistic.slas?.find(s => s.id === logistic.selectedSla)
		if (!sla) continue

		const isPickup = isPickupDelivery(sla.deliveryChannel)
		const productData = getProductData(items, logistic.itemIndex)

		if (currentSlasMap.has(sla.id)) {
			// Atualiza SLA existente
			const existing = currentSlasMap.get(sla.id)!
			existing.price += sla.price
			existing.formatedPrice = formatPrice(existing.price)
			existing.products.push({ itemIndex: logistic.itemIndex, ...productData })
		} else {
			// Cria nova entrada
			const address = getAddress({ ...sla, addressId: logistic.addressId }, selectedAddresses)

			currentSlasMap.set(sla.id, {
				id: sla.id,
				name: isPickup ? sla.pickupStoreInfo?.friendlyName : sla.name,
				isPickupInPoint: isPickup,
				address,
				pickupStoreInfo: sla.pickupStoreInfo,
				price: sla.price,
				formattedShippingEstimate: formatShippingEstimate(sla),
				formatedPrice: formatPrice(sla.price),
				products: [{ itemIndex: logistic.itemIndex, ...productData }]
			})
		}
	}

	return Array.from(currentSlasMap.values())
}
