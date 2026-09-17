import { Vtex } from 'eitri-shopping-vtex-shared'
import Eitri from 'eitri-bifrost'

export const getProductById = async productId => {
	return Vtex.searchGraphql.product({
		identifier: { field: 'id', value: productId }
	})
}

export const getProductBySlug = async slug => {
	return Vtex.searchGraphql.product({
		identifier: { field: 'slug', value: slug }
	})
}

export const getWhoSawAlsoSaw = async productId => {
	return Vtex.searchGraphql.productRecommendations({
		identifier: { field: 'id', value: productId },
		type: 'view'
	})
}

export const markLastViewedProduct = async product => {
	const key = `last-seen-products`

	const productHistory = await Eitri.sharedStorage.getItemJson(key)

	if (productHistory) {
		const prevContentIndex = productHistory.findIndex(content => content.productId === product.productId)
		if (prevContentIndex === 0) {
			return
		}
		if (prevContentIndex !== -1) {
			productHistory.splice(prevContentIndex, 1)
			productHistory.unshift({ productId: product.productId, date: new Date().toISOString() })
		} else {
			productHistory.unshift({ productId: product.productId, date: new Date().toISOString() })
		}
		await Eitri.sharedStorage.setItemJson(key, productHistory.slice(0, 14))
	} else {
		await Eitri.sharedStorage.setItemJson(key, [{ productId: product.productId, date: new Date().toISOString() }])
	}
}

const getValidBuyTogetherProducts = (products, currentProductId) => {
	return (products || []).filter(product => {
		if (!product?.productId || String(product.productId) === String(currentProductId)) {
			return false
		}

		return product?.items?.some(item =>
			item?.sellers?.some(seller => seller?.commertialOffer?.AvailableQuantity > 0)
		)
	})
}

export const showTogether = async productId => {
	try {
		const products = getValidBuyTogetherProducts(
			await Vtex.catalog.showTogether(productId),
			productId
		)
		if (products?.length > 0) return products
	} catch (error) {
		console.error('Error loading catalog buy together products', error)
	}

	const recommendationTypes = ['buy', 'viewAndBought', 'suggestions', 'similars', 'view']

	for (const type of recommendationTypes) {
		try {
			const products = getValidBuyTogetherProducts(
				await Vtex.searchGraphql.productRecommendations({
					identifier: { field: 'id', value: productId },
					type,
					groupBy: 'PRODUCT'
				}),
				productId
			)

			if (products?.length > 0) return products
		} catch (error) {
			console.error(`Error loading ${type} product recommendations`, error)
		}
	}

	return []
}

export const autocompleteSuggestions = async value => {
	return Vtex.catalog.autoCompleteSuggestions(value)
}

export const getProductByEan = async ean => {
	return Vtex.searchGraphql.product({ identifier: { field: 'ean', value: ean } })
}

export const getProductSiblingsService = async agrupadorCode => {
	if (!agrupadorCode) return []
	// VTEX IS treats multiple entries with the same key as OR — a single code returns all siblings
	const result = await Vtex.searchGraphql.productSearch({
		selectedFacets: [{ key: 'codigo-agrupador', value: agrupadorCode }],
		from: 0,
		// Cap: a single product group rarely exceeds 10 siblings; 19 provides safe headroom
		to: 19,
		hideUnavailableItems: true,
		options: { allowRedirect: false }
	})
	return result?.products || []
}
