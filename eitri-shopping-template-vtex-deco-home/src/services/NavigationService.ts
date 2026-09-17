import Eitri from 'eitri-bifrost'

interface NormalizedSearchData {
	facets: Array<{ key: string; value: string }>
	query?: string
	[key: string]: unknown
}

export const openCart = async (): Promise<void> => {
	try {
		Eitri.nativeNavigation.open({
			slug: 'cart'
		})
	} catch (e) {
		console.error('Erro ao navegar para o carrinho', e)
	}
}

export const openAccount = async (action?: string): Promise<void> => {
	Eitri.nativeNavigation.open({
		slug: 'account',
		initParams: { action }
	})
}

export const openProduct = async (product: unknown): Promise<void> => {
	try {
		Eitri.nativeNavigation.open({
			slug: 'pdp',
			initParams: { product }
		})
	} catch (e) {
		console.error('navigate to PDP: Error trying to open PDP', e)
	}
}

export const openProductById = async (productId: string): Promise<void> => {
	try {
		Eitri.nativeNavigation.open({
			slug: 'pdp',
			initParams: { productId }
		})
	} catch (e) {
		console.error('navigate to PDP: Error trying to open PDP', e)
	}
}

export const openProductBySlug = async (slug: string): Promise<void> => {
	try {
		Eitri.nativeNavigation.open({
			slug: 'pdp',
			initParams: { slug }
		})
	} catch (e) {
		console.error('navigate to PDP: Error trying to open PDP', e)
	}
}

const IGNORED_FACET_KEYS = new Set(['fuzzy', 'operator', 'channel', 'locale'])

export const normalizePath = (path: string): NormalizedSearchData => {
	const pathComponents = decodeURIComponent(path).split('?')
	const pathData = pathComponents[0].split('/').filter(Boolean)
	const queryParams = new URLSearchParams(pathComponents[1])
	const normalizedData: NormalizedSearchData = { facets: [] }

	if (pathData[0] === 's' && queryParams.has('q')) {
		normalizedData.query = decodeURIComponent((queryParams.get('q') ?? '').replace(/\+/g, ' '))
	} else if (queryParams.has('map')) {
		const mapKeys = (queryParams.get('map') ?? '').split(',')
		pathData.forEach((value, index) => {
			if (mapKeys[index] === 'ft') {
				normalizedData.query = value
			} else {
				normalizedData.facets.push({ key: mapKeys[index], value })
			}
		})
	} else if (queryParams.has('facets')) {
		const facetKeys = (queryParams.get('facets') ?? '').split(',')
		facetKeys.forEach(key => {
			if (!IGNORED_FACET_KEYS.has(key) && queryParams.has(key)) {
				normalizedData.facets.push({ key, value: queryParams.get(key) ?? '' })
			}
		})
	} else {
		pathData.forEach((value, index) => {
			normalizedData.facets.push({ key: `category-${index + 1}`, value })
		})
	}

	const skipKeys = new Set([
		'map',
		'facets',
		'page',
		...IGNORED_FACET_KEYS,
		...(queryParams.has('facets') ? (queryParams.get('facets') ?? '').split(',') : [])
	])
	for (const [key, value] of queryParams.entries()) {
		if (!skipKeys.has(key)) {
			normalizedData[key] = value
		}
	}

	return normalizedData
}

export const resolveNavigation = (path: string, title?: string): void => {
	const normalizedPath = normalizePath(path)
	Eitri.navigation.navigate({ path: 'ProductCatalog', state: { params: normalizedPath, title: title || '' } })
}
