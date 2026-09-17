import { Vtex } from 'eitri-shopping-vtex-shared'

export const getProductById = async productId => {
	return await Vtex.searchGraphql.product({
		identifier: { field: 'id', value: productId }
	})
}
