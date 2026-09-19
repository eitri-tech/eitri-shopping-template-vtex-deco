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
