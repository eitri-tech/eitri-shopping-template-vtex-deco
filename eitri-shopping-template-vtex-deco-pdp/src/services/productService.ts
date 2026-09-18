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

const getValidBuyTogetherProducts = (products: unknown, currentProductId: string): VtexProduct[] => {
	const list = Array.isArray(products) ? (products as VtexProduct[]) : []
	return list.filter(product => {
		if (!product?.productId || String(product.productId) === String(currentProductId)) {
			return false
		}

		return (product?.items ?? []).some(item =>
			(item?.sellers ?? []).some(seller => (seller?.commertialOffer?.AvailableQuantity ?? 0) > 0)
		)
	})
}

// Catalog "show together" first, then IS recommendation types as fallbacks — first non-empty wins.
export const showTogether = async (productId: string): Promise<VtexProduct[]> => {
	try {
		const products = getValidBuyTogetherProducts(await Vtex.catalog.showTogether(productId), productId)
		if (products.length > 0) return products
	} catch (error) {
		console.error('Error loading catalog buy together products', error)
	}

	const recommendationTypes: Array<'buy' | 'viewAndBought' | 'suggestions' | 'similars' | 'view'> = [
		'buy',
		'viewAndBought',
		'suggestions',
		'similars',
		'view'
	]

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

			if (products.length > 0) return products
		} catch (error) {
			console.error(`Error loading ${type} product recommendations`, error)
		}
	}

	return []
}

export const autocompleteSuggestions = async (value: string) => {
	return Vtex.catalog.autoCompleteSuggestions(value)
}

export const getProductByEan = async (ean: string) => {
	return Vtex.searchGraphql.product({ identifier: [{ field: 'ean', value: ean }] } as any)
}

export const getProductSiblingsService = async (agrupadorCode: string): Promise<VtexProduct[]> => {
	if (!agrupadorCode) return []
	// VTEX IS treats multiple entries with the same key as OR — a single code returns all siblings.
	// Same ProductSearchInput typing gap as the other searchGraphql calls above.
	const result = (await Vtex.searchGraphql.productSearch({
		selectedFacets: [{ key: 'codigo-agrupador', value: agrupadorCode }],
		from: 0,
		// Cap: a single product group rarely exceeds 10 siblings; 19 provides safe headroom
		to: 19,
		hideUnavailableItems: true,
		options: { allowRedirect: false }
	} as any)) as { products?: VtexProduct[] } | undefined
	return result?.products ?? []
}
