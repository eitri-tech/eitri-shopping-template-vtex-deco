import { openBrowser } from '../services/NavigationService'

// Links do site que não são vitrine: rota de API, checkout web, carrinho
// compartilhado do Sales App.
//
// Com o app instalado eles são capturados pelo intent filter (`GLOB: .*` no
// domínio da loja) e o resolver da Eitri não sabe o que fazer: não casam
// com nenhuma entrada do `deeplinkMap` e caem no fallback
// `resolveDeeplinkToProductCatalog`, que quebra o path em segmentos e chuta que
// cada um é categoria. Verificado no emulador com o carrinho compartilhado
// (`/api/io/_v/share/<code>`): initParams chegam como
// `{ params: { facets: [{key:"category-1",value:"api"}, …] }, route:"ProductCatalog" }`
// e a tela abre "Api > Io > _v > Share > <code>" + "No products found".
//
// Destino: sempre o www, em Custom Tab. O carrinho compartilhado do Sales App
// não é o carrinho do usuário — na web os dois convivem separados, enquanto o
// checkout nativo grava o orderForm em `<account>_vtex_cart_key` (shared
// storage) e sequestra a sacola. O caminho nativo (webFlow -> openCheckout)
// está no PR #277.
const RESERVED_FIRST_SEGMENTS = ['api', 'checkout', '_v', 'files']

// Domínio oficial da loja. Exige `inApp: true` no openBrowser (ver
// NavigationService.openBrowser): o app reivindica o domínio no intent filter,
// então navegador externo devolveria o clique pro próprio app.
// TODO: replace with your store domain
const WEB_HOST = 'https://www.YOUR_STORE_DOMAIN.com'

const CATEGORY_FACET = /^category-(\d+)$/

// Caminho A: uma entrada no `deeplinkMap` faz o resolver repassar a URL original
// em `initParams.deeplink` (DeeplinkResolver.js:169) — com query string e hash.
const pathFromDeeplink = deeplink => {
	if (typeof deeplink !== 'string') return null

	const withoutOrigin = deeplink.replace(/^https?:\/\/[^/]+/, '')
	return withoutOrigin === deeplink ? null : withoutOrigin
}

// Caminho B: sem entrada no mapa — remonta o path dos facets que o fallback de
// categoria inventou. É o estado atual de produção.
const pathFromCategoryFacets = facets => {
	if (!Array.isArray(facets)) return null

	const segments = facets
		.map(facet => [CATEGORY_FACET.exec(facet?.key ?? ''), facet?.value])
		.filter(([match, value]) => match && value)
		.sort(([a], [b]) => Number(a[1]) - Number(b[1]))
		.map(([, value]) => encodeURIComponent(value))

	return segments.length ? `/${segments.join('/')}` : null
}

const firstSegmentOf = path => path.split('?')[0].split('/').filter(Boolean)[0]

// ponytail: casa só pelo path, nunca por `route`. Foi o que derrubou a tentativa
// anterior (PR #227, revertido no #239, que tratava qualquer rota desconhecida
// como path do site e descartava os query params de links como
// `<app-scheme>://collection?filter=…&utm_source=…`).
export function resolveReservedPath(startParams) {
	const path =
		pathFromDeeplink(startParams?.deeplink) ??
		pathFromCategoryFacets(startParams?.params?.facets ?? startParams?.facets)

	if (!path) return null

	const firstSegment = firstSegmentOf(path)
	return RESERVED_FIRST_SEGMENTS.includes(firstSegment?.toLowerCase()) ? path : null
}

// Manda o deep link pro navegador. Retorna `false` quando não é path reservado,
// para o chamador seguir com o fluxo normal de rota.
export function handleReservedPathDeeplink(startParams) {
	const path = resolveReservedPath(startParams)
	if (!path) return false

	openBrowser(`${WEB_HOST}${path}`)
	return true
}
