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

export const getMinimumOrderValueInCents = (cart: VtexCart & { sellers?: any[] }, fallbackMinimumValueInCents = 0): number => {
	const sellers = cart?.sellers

	if (!Array.isArray(sellers) || sellers.length === 0) {
		return Math.max(0, fallbackMinimumValueInCents)
	}

	const minimumOrderValue = sellers.reduce((maxValue, seller) => {
		const sellerMinimum = Number(seller?.minimumOrderValue) || 0
		return Math.max(maxValue, sellerMinimum)
	}, 0)

	return Math.max(0, minimumOrderValue)
}

export const getMinimumOrderStatus = (
	cart: VtexCart & { sellers?: any[] },
	fallbackMinimumValueInCents = 0
): MinimumOrderStatus => {
	// fallbackMinimumValueInCents used to be silently dropped here — hasReachedMinimumOrderValue()
	// passed it down but this function never accepted it, so it never reached
	// getMinimumOrderValueInCents(). Threading it through restores the intended fallback.
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

export const hasReachedMinimumOrderValue = (cart: VtexCart & { sellers?: any[] }, fallbackMinimumValueInCents = 0): boolean => {
	return getMinimumOrderStatus(cart, fallbackMinimumValueInCents).hasReachedMinimumOrderValue
}
