import { Vtex } from 'eitri-shopping-vtex-shared'
import Eitri from 'eitri-bifrost'
import type { VtexProduct } from '../types/vtex'

interface LastSeenEntry {
	productId?: string
	date: string
	[key: string]: unknown
}

// ProductInput.identifier is a list of fallback identifiers, not a single object — the
// original calls sent a bare object, which doesn't match the GraphQL input type VTEX expects.
// ProductInput also demands `slug`/`regionId`/`salesChannel` this app never set — same library
// typing gap as ProductSearchInput/Facets (auto-generated from usage, not what these calls miss).
export const getProductById = async (productId: string) => {
	return Vtex.searchGraphql.product({
		identifier: [{ field: 'id', value: productId }]
	} as any)
}

export const getProductBySlug = async (slug: string) => {
	return Vtex.searchGraphql.product({
		identifier: [{ field: 'slug', value: slug }]
	} as any)
}

export const getWhoSawAlsoSaw = async (productId: string) => {
	return Vtex.searchGraphql.productRecommendations({
		identifier: { field: 'id', value: productId },
		type: 'view',
		groupBy: 'PRODUCT'
	})
}

export const markLastViewedProduct = async (product: VtexProduct): Promise<void> => {
	const key = `last-seen-products`

	const productHistory = (await Eitri.sharedStorage.getItemJson(key)) as LastSeenEntry[] | undefined

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

export const showTogether = async (productId: string) => {
	return Vtex.catalog.showTogether(productId)
}

export const autocompleteSuggestions = async (value: string) => {
	return Vtex.catalog.autoCompleteSuggestions(value)
}

export const getProductByEan = async (ean: string) => {
	return Vtex.searchGraphql.product({ identifier: [{ field: 'ean', value: ean }] } as any)
}
