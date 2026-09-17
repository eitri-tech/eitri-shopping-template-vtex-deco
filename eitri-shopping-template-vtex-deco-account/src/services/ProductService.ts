import { Vtex } from 'eitri-shopping-vtex-shared'

export const getProductById = async productId => {
	return await Vtex.searchGraphql.product({
		identifier: { field: 'id', value: productId }
	})
}

export const getProductBySkuId = async skuId => {
	return await Vtex.searchGraphql.product({
		identifier: { field: 'sku', value: skuId }
	})
}

export const loadSkuProducts = async skuIds => {
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
				]
			} catch (e) {
				console.error('loadSkuProducts error', skuId, e)
				return [skuId, null]
			}
		})
	)
	return Object.fromEntries(entries)
}
