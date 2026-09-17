import { Vtex } from 'eitri-shopping-vtex-shared'
import { CMS_PRODUCT_SORT } from '../utils/Constants'
import { resolveSortParam } from './helpers/resolveSortParam'

interface SearchParams {
	facets?: Array<{ key: string; value: string }>
	query?: string
	q?: string
	sort?: string
	from?: number
	to?: number
	count?: number
	[key: string]: unknown
}

export const autocompleteSuggestions = async (value: string) => {
	return await Vtex.catalog.autoCompleteSuggestions(value)
}

/*
 * {
 *  facets: Array<{ key: string, value: string }>
 *  query: string
 *  sort: string
 *
 * } *
 * */

export const getProductsService = async (params: SearchParams, page?: number) => {
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

	const options: Record<string, unknown> = {
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

export const getProductsServiceRest = async (params: SearchParams, page?: number) => {
	const facetsPath = params?.facets?.map(facet => `${facet.key}/${facet.value}`).join('/')
	const options: Record<string, unknown> = {
		query: params?.query || params?.q || '',
		page: page ?? 1,
		sort: resolveSortParam(params.sort)
	}
	if (params?.count) {
		options.count = params.count
	}
	return await Vtex.catalog.getProductsByFacets(facetsPath, options)
}

export const getProductsFacetsService = async (params: SearchParams) => {
	// Validar se params está presente e é um objeto válido
	if (!params || typeof params !== 'object') {
		throw new Error('Invalid parameters provided to getProductsFacetsService')
	}

	// Garantir que selectedFacets seja um array válido ou null
	const selectedFacets = Array.isArray(params?.facets) ? params.facets : null

	const options: Record<string, unknown> = {
		fullText: params?.query || params?.q || '',
		selectedFacets: selectedFacets,
		hideUnavailableItems: true
	}

	// Remover propriedades undefined que podem causar problemas no GraphQL
	Object.keys(options).forEach(key => {
		if (options[key] === undefined) {
			delete options[key]
		}
	})

	// Same library typing gap as productSearch above — Facets demands many fields
	// (removeHiddenFacets, behavior, operator, fuzzy, searchState, categoryTreeBehavior...)
	// this call never set and relies on server-side defaults for.
	const result = (await Vtex.searchGraphql.facets(options as any)) as { facets?: unknown[] } | undefined

	// Validar e garantir estrutura do resultado
	if (!result || typeof result !== 'object') {
		return { facets: [] }
	}

	// Garantir que facets seja sempre um array
	if (!Array.isArray(result.facets)) {
		return { facets: [] }
	}

	return result
}

export const getProductsFacetsServiceRest = async (params: SearchParams) => {
	const facetsPath = params?.facets?.map(facet => `${facet.key}/${facet.value}`).join('/')
	const options = {
		query: params?.query || params?.q || ''
	}

	const result = await Vtex.catalog.getPossibleFacets(facetsPath, options)

	return formatPriceRangeFacet(result)
}

interface PriceRangeFacetValue {
	range?: { from?: number; to?: number }
	name?: string
	value?: string
	[key: string]: unknown
}

interface Facet {
	type?: string
	values?: PriceRangeFacetValue[]
	[key: string]: unknown
}

const formatPriceRangeFacet = (facetQueryResult: { facets: Facet[] }) => {
	return facetQueryResult.facets.map(facet => {
		if (facet.type === 'PRICERANGE') {
			return {
				...facet,
				values: (facet.values ?? []).map(value => {
					return {
						...value,
						name: `De ${(value?.range?.from ?? 0).toLocaleString('pt-br', {
							style: 'currency',
							currency: 'BRL'
						})} à ${(value?.range?.to ?? 0).toLocaleString('pt-br', {
							style: 'currency',
							currency: 'BRL'
						})}`,
						value: `${value?.range?.from}:${value?.range?.to}`
					}
				})
			}
		} else {
			return facet
		}
	})
}

// ProductInput.identifier is a list of fallback identifiers, not a single object — the
// original calls sent a bare object, which doesn't match the GraphQL input type VTEX expects.
// ProductInput also demands `slug`/`regionId`/`salesChannel` this app never set — same library
// typing gap as ProductSearchInput/Facets above (auto-generated from usage).
export const getProductById = async (productId: string) => {
	return await Vtex.searchGraphql.product({
		identifier: [{ field: 'id', value: productId }]
	} as any)
}

let cachedCategoryTree: unknown = null
export const getCategoryTree = async (levels: number) => {
	if (cachedCategoryTree) {
		return cachedCategoryTree
	}
	const res = await Vtex.catalog.getCategoryTree(levels)
	cachedCategoryTree = res
	return res
}

export const getProductByEan = async (ean: string) => {
	return await Vtex.searchGraphql.product({ identifier: [{ field: 'ean', value: ean }] } as any)
}
