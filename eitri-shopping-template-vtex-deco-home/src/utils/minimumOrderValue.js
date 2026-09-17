const getTotalizerById = (totalizers, id) => totalizers.find(item => item.id === id)

export const getCartValueInCents = cart => {
	const totalizers = cart?.totalizers || []
	const items = getTotalizerById(totalizers, 'Items')
	const discounts = getTotalizerById(totalizers, 'Discounts')
	return Math.max(0, (items?.value || 0) + (discounts?.value || 0))
}

export const getMinimumOrderValueInCents = cart => {
	const sellers = cart?.sellers

	if (!Array.isArray(sellers) || sellers.length === 0) {
		return 0
	}

	const minimumOrderValue = sellers.reduce((maxValue, seller) => {
		const sellerMinimum = Number(seller?.minimumOrderValue) || 0
		return Math.max(maxValue, sellerMinimum)
	}, 0)

	return Math.max(0, minimumOrderValue)
}

export const getMinimumOrderStatus = cart => {
	const minimumValueInCents = getMinimumOrderValueInCents(cart)
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

export const hasReachedMinimumOrderValue = (cart, fallbackMinimumValueInCents = 0) => {
	return getMinimumOrderStatus(cart, fallbackMinimumValueInCents).hasReachedMinimumOrderValue
}
