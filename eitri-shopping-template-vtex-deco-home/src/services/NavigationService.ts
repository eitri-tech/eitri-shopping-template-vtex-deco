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

export const openCheckout = (orderFormId?: string): void => {
	try {
		Eitri.nativeNavigation.open({
			slug: 'checkout',
			initParams: { orderFormId }
		})
	} catch (e) {
		console.error('Erro ao navegar para o checkout', e)
	}
}

// Navegador do sistema, não WebView: o fluxo que sai daqui pode terminar em
// pagamento, e reCAPTCHA/gateway não são confiáveis dentro de WebView.
export const openBrowser = (url: string): void => {
	try {
		// `inApp: true` abre uma Chrome Custom Tab (o app empacota
		// androidx.browser.customtabs) — motor e cookies do Chrome, sem WebView e sem
		// resolução de intent. Obrigatório aqui: as URLs desta função estão no
		// domínio da loja, que o app reivindica no intent filter (`GLOB: .*`),
		// então navegador externo devolveria o clique pro próprio app, em loop.
		Eitri.openBrowser({ url, inApp: true })
	} catch (e) {
		console.error('Erro ao abrir o navegador', e)
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

	// Intelligent Search: facets vêm como query params `filter.<key>=<value>`,
	// podendo repetir a mesma key (ex.: filter.material=x&filter.material=y).
	const filterEntries = [...queryParams.entries()].filter(([key]) => key.startsWith('filter.'))

	if (pathData[0] === 's' && queryParams.has('q')) {
		normalizedData.query = decodeURIComponent((queryParams.get('q') ?? '').replace(/\+/g, ' '))
	} else if (filterEntries.length) {
		filterEntries.forEach(([key, value]) => {
			normalizedData.facets.push({ key: key.slice('filter.'.length), value })
		})
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
		...(queryParams.has('facets') ? (queryParams.get('facets') ?? '').split(',') : []),
		...filterEntries.map(([key]) => key)
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
