// O bundler do Eitri só empacota import() quando o caminho é string literal fixa
// (mesmo padrão do PAGE_LOADERS em DecoCMSContentRender). As regras de badge são
// editadas via Deco CMS e persistidas neste bloco.
const loadBadgesBlock = () => import('../../.deco/blocks/config-Badges.json')

/**
 * Monta os badges de um produto a partir de duas fontes:
 *  - Fonte A: teasers da oferta comercial do SKU (não editável via CMS).
 *  - Fonte B: regras de badge do Deco CMS (`config-Badges.json`).
 *
 * A assinatura mantém `_vtexContext`/`_contentType` por compatibilidade com os
 * consumidores existentes, mas eles não são mais usados (a fonte é o Deco).
 */
export default async function getBadgesForProducts(product, currentSku, _vtexContext, _contentType) {
	const badges = []

	// Fonte A — teasers da oferta comercial do SKU
	const sellerDefault = currentSku?.sellers?.find(s => s.sellerDefault)
	for (const teaser of sellerDefault?.commertialOffer?.teasers ?? []) {
		const promoText = parsePromo(teaser.name)
		if (promoText) {
			badges.push({
				text: promoText,
				color: '#8b153f',
				bgColor: '#ffffff'
			})
		}
	}

	// Fonte B — regras de badge do Deco CMS
	const rules = await loadDecoBadgeRules()
	for (const rule of rules) {
		if (matchesProduct(rule, product)) badges.push(rule)
	}

	return badges.filter((item, index, arr) => arr.findIndex(b => JSON.stringify(b) === JSON.stringify(item)) === index)
}

/**
 * Verifica se uma regra de badge se aplica ao produto, conforme o `type`:
 *  - product: `values` inclui o `productId`.
 *  - category: algum `values` bate com um id de `categoryTree`.
 *  - collection: algum `values` bate com um id de `productClusters`.
 */
function matchesProduct(rule, product) {
	const values = (rule?.values ?? []).map(String)
	if (!values.length) return false

	if (rule.type === 'product') {
		return values.includes(String(product?.productId))
	}
	if (rule.type === 'category') {
		return values.some(id => product?.categoryTree?.some(cat => String(cat.id) === id))
	}
	if (rule.type === 'collection') {
		return values.some(id => product?.productClusters?.some(cluster => String(cluster.id) === id))
	}
	return false
}

function parsePromo(text) {
	try {
		// Checar o padrão do texto de teaser da loja
		const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim()

		const patterns = [
			/leve\s+(\d+)\s+por\s+r?\$\s*([\d.,]+)\s*(cada)?/,
			/(\d+)\s+por\s+r?\$\s*([\d.,]+)\s*(cada)?/,
			/(\d+)\s+unidades?\s+por\s+r?\$\s*([\d.,]+)\s*(cada)?/
		]

		for (const pattern of patterns) {
			const match = normalized.match(pattern)

			if (match) {
				const quantity = match[1]
				const price = match[2]
				const hasCada = !!match[3]

				return hasCada ? `${quantity} por R$ ${price} cada` : `${quantity} por R$ ${price}`
			}
		}

		return null
	} catch (e) {
		console.log('e', e)
	}
}

/**
 * Carrega as regras de badge do Deco CMS já filtradas por vigência.
 * O JSON é estático no bundle, então não há cache/rede a gerir.
 */
export const loadDecoBadgeRules = async () => {
	try {
		const mod = await loadBadgesBlock()
		const rules = mod?.default?.rules ?? mod?.rules ?? []
		const now = new Date()
		return rules.filter(rule => isWithinValidDateRange(rule?.startDate, rule?.endDate, now))
	} catch (e) {
		console.error('[BadgesService] Falha ao carregar config-Badges.json', e)
		return []
	}
}

const isWithinValidDateRange = (startDateStr, endDateStr, now) => {
	const hasStart = !!startDateStr
	const hasEnd = !!endDateStr

	const start = hasStart ? new Date(startDateStr) : null
	const end = hasEnd ? new Date(endDateStr) : null

	if ((start && isNaN(start)) || (end && isNaN(end))) return false

	if (start && now < start) return false
	if (end && now > end) return false

	return true
}
