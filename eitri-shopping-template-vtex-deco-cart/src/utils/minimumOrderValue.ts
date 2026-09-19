import { RemoteConfig } from 'eitri-shopping-vtex-shared'
import type { VtexCart, VtexTotalizer } from '../types/vtex'

interface MinimumOrderStatus {
	currentValueInCents: number
	minimumValueInCents: number
	missingValueInCents: number
	progress: number
	hasReachedMinimumOrderValue: boolean
}

const getTotalizerById = (totalizers: VtexTotalizer[], id: string): VtexTotalizer | undefined =>
	totalizers.find(item => item.id === id)

export const getCartValueInCents = (cart?: VtexCart): number => {
	const totalizers = cart?.totalizers || []
	const items = getTotalizerById(totalizers, 'Items')
	const discounts = getTotalizerById(totalizers, 'Discounts')
	return Math.max(0, (items?.value || 0) + (discounts?.value || 0))
}

export const getMinimumOrderValueInCents = (cart?: VtexCart, fallbackMinimumValueInCents = 0): number => {
	// fallbackMinimumValueInCents is unused here, matching the commented-out logic below — the
	// remote config value is trusted as-is, same as before this file had types.
	return RemoteConfig.getContent('appConfigs.minimumOrderValueInCents')
	// const sellers = cart?.sellers
	// if (!Array.isArray(sellers) || sellers.length === 0) {
	// 	return Math.max(0, Number(fallbackMinimumValueInCents) || 0)
	// }
	//
	// const minimumOrderValue = sellers.reduce((maxValue, seller) => {
	// 	const sellerMinimum = Number(seller?.minimumOrderValue) || 0
	// 	return Math.max(maxValue, sellerMinimum)
	// }, 0)
	//
	// return Math.max(0, minimumOrderValue)
}

export const getMinimumOrderStatus = (cart?: VtexCart, fallbackMinimumValueInCents = 0): MinimumOrderStatus => {
	const minimumValueInCents = getMinimumOrderValueInCents(cart, fallbackMinimumValueInCents)
	const currentValueInCents = getCartValueInCents(cart)

	if (minimumValueInCents <= 0) {
		return {
			currentValueInCents,
			minimumValueInCents,
			missingValueInCents: 0,
			progress: 100,
			hasReachedMinimumOrderValue: true
		}
	}

	const missingValueInCents = Math.max(minimumValueInCents - currentValueInCents, 0)
	const progress = Math.min((currentValueInCents / minimumValueInCents) * 100, 100)

	return {
		currentValueInCents,
		minimumValueInCents,
		missingValueInCents,
		progress,
		hasReachedMinimumOrderValue: missingValueInCents === 0
	}
}

export const hasReachedMinimumOrderValue = (cart?: VtexCart, fallbackMinimumValueInCents = 0): boolean => {
	return getMinimumOrderStatus(cart, fallbackMinimumValueInCents).hasReachedMinimumOrderValue
}
