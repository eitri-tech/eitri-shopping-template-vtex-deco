import { Vtex } from 'eitri-shopping-vtex-shared'
import type { VtexProduct } from '../types/vtex'

// ProductInput.identifier is `{field, value}[]` — a single object here silently sent the wrong
// GraphQL variable shape. The other ProductInput fields (slug/regionId/salesChannel) are
// declared required by the lib's .d.ts but were never provided by this pre-existing call; kept
// as-is via a cast rather than guessing values that would change behavior.
export const getProductById = async (productId: string): Promise<VtexProduct> => {
	return await Vtex.searchGraphql.product({
		identifier: [{ field: 'id', value: productId }]
	} as any)
}

export const getProductBySkuId = async (skuId: string): Promise<VtexProduct> => {
	return await Vtex.searchGraphql.product({
		identifier: [{ field: 'sku', value: skuId }]
	} as any)
}

interface SkuProductEntry {
	product: VtexProduct
	name?: string
	brand?: string
	imageUrl?: string
	price?: number
}

export const loadSkuProducts = async (skuIds: string[]): Promise<Record<string, SkuProductEntry | null>> => {
	const entries = await Promise.all(
		[...new Set(skuIds)].map(async skuId => {
			try {
				const product = await getProductBySkuId(skuId)
				const sku = product?.items?.find(item => item.itemId === skuId) || product?.items?.[0]
				return [
					skuId,
					{
						product,
						name: sku?.nameComplete || sku?.name || product?.productName,
						brand: product?.brand,
						imageUrl: sku?.images?.[0]?.imageUrl,
						price:
							sku?.sellers?.find(seller => seller.sellerDefault)?.commertialOffer?.Price ??
							sku?.sellers?.[0]?.commertialOffer?.Price
					}
				] as [string, SkuProductEntry]
			} catch (e) {
				console.error('loadSkuProducts error', skuId, e)
				return [skuId, null] as [string, null]
			}
		})
	)
	return Object.fromEntries(entries)
}
