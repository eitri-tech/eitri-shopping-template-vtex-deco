import Eitri from 'eitri-bifrost'

export default async function getBadgesForProducts(product, currentSku, VtexContext, contentType) {
	const flagContentSections = await getCmsContent(VtexContext, contentType)
	const badge = []

	const sellerDefault = currentSku?.sellers?.find(s => s.sellerDefault)
	for (const teaser of sellerDefault?.commertialOffer?.teasers) {
		const promoText = parsePromo(teaser.name)
		if (promoText) {
			badge.push({
				text: promoText,
				color: '#8b153f',
				bgColor: '#ffffff'
			})
		}
	}

	for (const section of flagContentSections) {
		if (section.data?.type === 'product' && section.data?.values?.includes(product.productId)) {
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

let promiseHolder = {}
export const getCmsContent = async (Vtex, contentType) => {
	if (!promiseHolder[contentType]) {
		promiseHolder[contentType] = fetchData(Vtex, contentType)
	}
	return promiseHolder[contentType]
}

export const fetchData = async (Vtex, contentType) => {
	try {
		const { faststore } = Vtex?.configs
		const cachedPage = await loadPageFromCache(contentType)

		if (cachedPage) {
			loadVtexCmsPage(faststore, contentType, Vtex)
				.then(page => {
					if (page) {
						savePageInCache(contentType, page)
					}
				})
				.catch(e => {})

			return cachedPage
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

export const loadVtexCmsPage = async (faststore, contentType, Vtex) => {
	try {
		const result = await Vtex.cms.getPagesByContentTypes(faststore, contentType)
		let sections = result?.data?.reduce((acc, page) => {
			acc = [...acc, ...page.sections]
			return acc
		}, [])

		if (!sections) return null

		const now = new Date()

		const ALLOWED_SECTIONS = ['Badges', 'Flags']

		return sections?.filter(section => {
			if (!ALLOWED_SECTIONS.includes(section.name)) return false

			const { startDate, endDate } = section?.data || {}

			return isWithinValidDateRange(startDate, endDate, now)
		})
	} catch (error) {
		console.error('Error loading VTEX CMS page:', error)
		return null
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

export const loadPageFromCache = async cacheKey => {
	try {
		const content = await Eitri.sharedStorage.getItemJson(cacheKey)
		if (!content || !content.page) return

		const inputDate = new Date(content.cachedIn)
		const currentDate = new Date()
		const differenceInMs = currentDate - inputDate
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

export const savePageInCache = async (cacheKey, page) => {
	try {
		Eitri.sharedStorage.setItemJson(cacheKey, { cachedIn: new Date().toISOString(), page })
	} catch (error) {
		console.error('Error trying save in cache', error)
	}
}
