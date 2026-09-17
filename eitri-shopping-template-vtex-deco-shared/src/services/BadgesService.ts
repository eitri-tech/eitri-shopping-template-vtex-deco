import Eitri from 'eitri-bifrost'
import type { VtexProduct, VtexSku } from '../types/vtex'

interface CmsContext {
	configs?: { faststore?: unknown; [key: string]: unknown }
	cms: {
		getPagesByContentTypes: (faststore: unknown, contentType: string) => Promise<{ data?: Array<{ sections?: CmsSection[] }> }>
	}
	[key: string]: unknown
}

interface CmsSection {
	name?: string
	data?: {
		type?: string
		values?: string[]
		startDate?: string
		endDate?: string
		[key: string]: unknown
	}
}

interface Badge {
	text: string
	color: string
	bgColor: string
}

export default async function getBadgesForProducts(
	product: VtexProduct,
	currentSku: VtexSku,
	VtexContext: CmsContext,
	contentType: string
): Promise<Array<Badge | CmsSection['data']>> {
	const flagContentSections = (await getCmsContent(VtexContext, contentType)) ?? []
	const badge: Array<Badge | CmsSection['data']> = []

	const sellerDefault = currentSku?.sellers?.find(s => s.sellerDefault)
	// commertialOffer.teasers can be missing entirely — without the fallback this throws on
	// any SKU whose default seller has no active teaser promotion.
	const teasers = ((sellerDefault?.commertialOffer as { Teaser?: unknown; teasers?: Array<{ name?: string }> })
		?.teasers ?? []) as Array<{ name?: string }>
	for (const teaser of teasers) {
		const promoText = parsePromo(teaser.name ?? '')
		if (promoText) {
			badge.push({
				text: promoText,
				color: '#8b153f',
				bgColor: '#ffffff'
			})
		}
	}

	for (const section of flagContentSections) {
		if (section.data?.type === 'product' && product.productId && section.data?.values?.includes(product.productId)) {
			badge.push(section.data)
		}
		if (section.data?.type === 'category') {
			const hasCategory = section.data?.values?.some(catId =>
				product?.categoryTree?.some(prodCat => String(prodCat.id) === catId)
			)
			if (hasCategory) badge.push(section.data)
		}
		if (section.data?.type === 'collection') {
			const hasCategory = section.data?.values?.some(catId =>
				product?.productClusters?.some(prodCluster => String(prodCluster.id) === catId)
			)
			if (hasCategory) badge.push(section.data)
		}
	}
	return badge.filter((item, index, arr) => arr.findIndex(b => JSON.stringify(b) === JSON.stringify(item)) === index)
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

const promiseHolder: Record<string, Promise<CmsSection[] | null>> = {}
export const getCmsContent = async (Vtex: CmsContext, contentType: string): Promise<CmsSection[] | null> => {
	if (!promiseHolder[contentType]) {
		promiseHolder[contentType] = fetchData(Vtex, contentType)
	}
	return promiseHolder[contentType]
}

export const fetchData = async (Vtex: CmsContext, contentType: string): Promise<CmsSection[] | null> => {
	try {
		const { faststore } = Vtex?.configs ?? {}
		const cachedPage = await loadPageFromCache(contentType)

		if (cachedPage) {
			loadVtexCmsPage(faststore, contentType, Vtex)
				.then(page => {
					if (page) {
						savePageInCache(contentType, page)
					}
				})
				.catch(e => {})

			return cachedPage as CmsSection[]
		}

		const page = await loadVtexCmsPage(faststore, contentType, Vtex)
		if (page) {
			savePageInCache(contentType, page)
			return page
		} else {
			return null
		}
	} catch (e) {
		console.error('Error trying get content', e)
	}

	return null
}

export const loadVtexCmsPage = async (faststore: unknown, contentType: string, Vtex: CmsContext): Promise<CmsSection[] | null> => {
	try {
		const result = await Vtex.cms.getPagesByContentTypes(faststore, contentType)
		let sections = result?.data?.reduce<CmsSection[]>((acc, page) => {
			acc = [...acc, ...(page.sections ?? [])]
			return acc
		}, [])

		if (!sections) return null

		const now = new Date()

		const ALLOWED_SECTIONS = ['Badges', 'Flags']

		return sections?.filter(section => {
			if (!ALLOWED_SECTIONS.includes(section.name ?? '')) return false

			const { startDate, endDate } = section?.data || {}

			return isWithinValidDateRange(startDate, endDate, now)
		})
	} catch (error) {
		console.error('Error loading VTEX CMS page:', error)
		return null
	}
}

const isWithinValidDateRange = (startDateStr: string | undefined, endDateStr: string | undefined, now: Date): boolean => {
	const hasStart = !!startDateStr
	const hasEnd = !!endDateStr

	const start = hasStart ? new Date(startDateStr as string) : null
	const end = hasEnd ? new Date(endDateStr as string) : null

	if ((start && isNaN(start.getTime())) || (end && isNaN(end.getTime()))) return false

	if (start && now < start) return false
	if (end && now > end) return false

	return true
}

export const loadPageFromCache = async (cacheKey: string): Promise<unknown> => {
	try {
		const content = (await Eitri.sharedStorage.getItemJson(cacheKey)) as { page?: unknown; cachedIn?: string } | undefined
		if (!content || !content.page) return

		const inputDate = new Date(content.cachedIn as string)
		const currentDate = new Date()
		const differenceInMs = currentDate.getTime() - inputDate.getTime()
		const twentyFourHoursInMs = 86400000
		if (differenceInMs > twentyFourHoursInMs) {
			console.log('Cache expirado, buscando novo...')
			return null
		}
		return content.page
	} catch (error) {
		console.error('Error trying load from cache', error)
		return null
	}
}

export const savePageInCache = async (cacheKey: string, page: unknown): Promise<void> => {
	try {
		Eitri.sharedStorage.setItemJson(cacheKey, { cachedIn: new Date().toISOString(), page })
	} catch (error) {
		console.error('Error trying save in cache', error)
	}
}
