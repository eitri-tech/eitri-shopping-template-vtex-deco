import { Vtex } from 'eitri-shopping-vtex-shared'
import { resolveSortParam } from './helpers/resolveSortParam'
import type { Facet } from '../sections/types'

export interface ProductSearchParams {
	facets?: Facet[]
	query?: string
	q?: string
	sort?: string
	from?: number
	to?: number
}

/**
 * Busca produtos na Intelligent Search (GraphQL) da VTEX.
 * Portado de `home/src/services/ProductService.js`.
 */
export const getProductsService = async (params: ProductSearchParams, page?: number): Promise<any> => {
	const PAGE_SIZE = 12

	// Validar se params está presente e é um objeto válido
	if (!params || typeof params !== 'object') {
		return null
	}

	// Validar se facets é um array válido quando presente
	if (params.facets && !Array.isArray(params.facets)) {
		return null
	}

	let from = params?.from || 1
	let to = params?.to || PAGE_SIZE

	if (page) {
		from = (page - 1) * PAGE_SIZE + 1
		to = page * PAGE_SIZE
	}

	// Garantir que selectedFacets seja um array válido ou null
	const selectedFacets = Array.isArray(params?.facets) ? params.facets : null

	const options: Record<string, any> = {
		fullText: params?.query || params?.q || '',
		selectedFacets: selectedFacets,
		orderBy: resolveSortParam(params?.sort, true),
		from: from,
		to: to,
		hideUnavailableItems: true,
		options: {
			allowRedirect: false
		}
	}

	// Remover propriedades undefined/null que podem causar problemas no GraphQL
	Object.keys(options).forEach(key => {
		if (options[key] === undefined || options[key] === null) {
			delete options[key]
		}
	})

	// eitri-shopping-vtex-shared's ProductSearchInput stub demands many fields (salesChannel,
	// priceRange, simulationBehavior, operator, fuzzy, searchState...) this app never set and
	// doesn't even list the `orderBy` field the code actually relies on — a library typing gap
	// (auto-generated from usage), not something this call is missing.
	return await Vtex.searchGraphql.productSearch(options as any)
}

// ProductInput.identifier is a list of fallback identifiers, not a single object — the original
// call sent a bare object, which doesn't match the GraphQL input type VTEX expects. ProductInput
// also demands `slug`/`regionId`/`salesChannel` this app never set — same library typing gap as
// ProductSearchInput/Facets above (auto-generated from usage).
export const getProductById = async (productId: string): Promise<any> => {
	return await Vtex.searchGraphql.product({
		identifier: [{ field: 'id', value: productId }]
	} as any)
}

let cachedCategoryTree: any = null
export const getCategoryTree = async (levels: number): Promise<any> => {
	if (cachedCategoryTree) {
		return cachedCategoryTree
	}
	const res = await Vtex.catalog.getCategoryTree(levels)
	cachedCategoryTree = res
	return res
}

export const getProductsFacetsService = async (params: ProductSearchParams): Promise<any> => {
	if (!params || typeof params !== 'object') {
		throw new Error('Invalid parameters provided to getProductsFacetsService')
	}

	const selectedFacets = Array.isArray(params?.facets) ? params.facets : null

	const options: Record<string, any> = {
		fullText: params?.query || params?.q || '',
		selectedFacets: selectedFacets,
		hideUnavailableItems: true
	}

	Object.keys(options).forEach(key => {
		if (options[key] === undefined) {
			delete options[key]
		}
	})

	// Same Facets typing gap as ProductSearchInput above (auto-generated from usage).
	const result = await Vtex.searchGraphql.facets(options as any)

	if (!result || typeof result !== 'object') {
		return { facets: [] }
	}
	if (!Array.isArray(result.facets)) {
		return { facets: [] }
	}

	return result
}

export const getProductSiblingsService = async (agrupadorCodes: string[]): Promise<any[]> => {
	if (!Array.isArray(agrupadorCodes) || agrupadorCodes.length === 0) {
		return []
	}

	const options = {
		// VTEX IS trata múltiplas entradas com a mesma key como OR — retorna produtos que casam com qualquer code
		selectedFacets: agrupadorCodes.map(code => ({ key: 'codigo-agrupador', value: code })),
		from: 0,
		to: 99,
		hideUnavailableItems: true,
		options: {
			allowRedirect: false
		}
	}

	// Same ProductSearchInput typing gap as productSearch above.
	return (await Vtex.searchGraphql.productSearch(options as any))?.products || []
}
