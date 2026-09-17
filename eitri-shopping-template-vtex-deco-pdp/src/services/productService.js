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

export const showTogether = async productId => {
	return Vtex.catalog.showTogether(productId)
}

export const autocompleteSuggestions = async value => {
	return Vtex.catalog.autoCompleteSuggestions(value)
}

export const getProductByEan = async ean => {
	return Vtex.searchGraphql.product({ identifier: { field: 'ean', value: ean } })
}
