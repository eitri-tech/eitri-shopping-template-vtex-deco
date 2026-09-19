import type { VtexProduct, VtexSku } from '../types/vtex'

// O bundler do Eitri só empacota import() quando o caminho é string literal fixa
// (mesmo padrão do PAGE_LOADERS em DecoCMSContentRender). As regras de badge são
// editadas via Deco CMS e persistidas neste bloco.
const loadBadgesBlock = () => import('../../.deco/blocks/config-Badges.json')

export interface BadgeRule {
	type?: 'product' | 'category' | 'collection' | string
	values?: Array<string | number>
	startDate?: string
	endDate?: string
	[key: string]: unknown
}

export interface TeaserBadge {
	text: string
	color: string
	bgColor: string
}

export type ProductBadge = TeaserBadge | BadgeRule

/**
 * Monta os badges de um produto a partir de duas fontes:
 *  - Fonte A: teasers da oferta comercial do SKU (não editável via CMS).
 *  - Fonte B: regras de badge do Deco CMS (`config-Badges.json`).
 *
 * A assinatura mantém `_vtexContext`/`_contentType` por compatibilidade com os
 * consumidores existentes, mas eles não são mais usados (a fonte é o Deco).
 */
export default async function getBadgesForProducts(
	product: VtexProduct,
	currentSku: VtexSku | undefined,
	_vtexContext?: unknown,
	_contentType?: string
): Promise<ProductBadge[]> {
	const badges: ProductBadge[] = []

	// Fonte A — teasers da oferta comercial do SKU
	const sellerDefault = currentSku?.sellers?.find(s => s.sellerDefault)
	// commertialOffer.teasers can be missing entirely — without the fallback this throws on
	// any SKU whose default seller has no active teaser promotion.
	const teasers = ((sellerDefault?.commertialOffer as { teasers?: Array<{ name?: string }> } | undefined)
		?.teasers ?? []) as Array<{ name?: string }>
	for (const teaser of teasers) {
		const promoText = parsePromo(teaser.name ?? '')
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
function matchesProduct(rule: BadgeRule, product: VtexProduct): boolean {
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

function parsePromo(text: string): string | null | undefined {
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
export const loadDecoBadgeRules = async (): Promise<BadgeRule[]> => {
	try {
		const mod = (await loadBadgesBlock()) as { default?: { rules?: BadgeRule[] }; rules?: BadgeRule[] }
		const rules = mod?.default?.rules ?? mod?.rules ?? []
		const now = new Date()
		return rules.filter(rule => isWithinValidDateRange(rule?.startDate, rule?.endDate, now))
	} catch (e) {
		console.error('[BadgesService] Falha ao carregar config-Badges.json', e)
		return []
	}
}

const isWithinValidDateRange = (startDateStr: string | undefined, endDateStr: string | undefined, now: Date): boolean => {
	const start = startDateStr ? new Date(startDateStr) : null
	const end = endDateStr ? new Date(endDateStr) : null

	if ((start && isNaN(start.getTime())) || (end && isNaN(end.getTime()))) return false

	if (start && now < start) return false
	if (end && now > end) return false

	return true
}
