import { Vtex } from 'eitri-shopping-vtex-shared'
import { getFbRemoteConfig } from './RemoteConfigService'
import Eitri from 'eitri-bifrost'
import type { CmsPageContent, CmsSection } from '../types/vtex'

export const getCmsContent = async (contentType: string, pageName?: string): Promise<CmsPageContent | null> => {
	try {
		if (!pageName) return null

		const { faststore } = Vtex.configs
		const cachedPage = null

		if (cachedPage) {
			loadVtexCmsPage(faststore, contentType, pageName)
				.then(page => {
					if (page) {
						savePageInCache(faststore, contentType, pageName, page)
					}
				})
				.catch(e => {})

			return cachedPage
		}

		const page = await loadVtexCmsPage(faststore, contentType, pageName)
		if (page) {
			savePageInCache(faststore, contentType, pageName, page)
			return { sections: page.sections, settings: page.settings }
		} else {
			return null
		}
	} catch (e) {
		console.error('Error trying get content', e)
	}

	return null
}

export const loadVtexCmsPage = async (
	faststore: unknown,
	contentType: string,
	pageName: string
): Promise<CmsPageContent | null> => {
	try {
		const result = await Vtex.cms.getPagesByContentTypes(faststore, contentType, { 'filters[name]': pageName })
		let page = result?.data?.[0] as CmsPageContent | undefined
		if (!page) return null

		const now = new Date()

		page.sections = page?.sections?.filter(section => {
			const name = section?.name
			const { startDate, endDate, images } = section?.data || {}

			// Remove section se estiver fora do intervalo
			if (!isWithinValidDateRange(startDate, endDate, now)) return false

			// Se for MultipleImageBanner, filtra banners com mesma lógica
			if (name === 'MultipleImageBanner' && Array.isArray(images)) {
				section.data!.images = images.filter(img => {
					return isWithinValidDateRange(img.startDate, img.endDate, now)
				})
			}

			return true
		})
		return filterRemoteConfigContent(page)
	} catch (error) {
		console.error('Error loading VTEX CMS page:', pageName, error)
		return null
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

export const loadPageFromCache = async (
	faststore: string,
	contentType: string,
	pageName: string
): Promise<(CmsPageContent & { cachedIn?: string }) | null | undefined> => {
	try {
		const cacheKey = `${faststore}_${contentType}_${pageName}`
		const content = (await Eitri.sharedStorage.getItemJson(cacheKey)) as
			| (CmsPageContent & { cachedIn?: string })
			| undefined
		if (!content) return

		const inputDate = new Date(content.cachedIn as string)
		const currentDate = new Date()
		const differenceInMs = currentDate.getTime() - inputDate.getTime()
		const twentyFourHoursInMs = 86400000
		if (differenceInMs > twentyFourHoursInMs) {
			console.log('Cache expirado, buscando novo...')
			return null
		}
		return content
	} catch (error) {
		console.error('Error trying load from cache', error)
		return null
	}
}

export const savePageInCache = async (
	faststore: string,
	contentType: string,
	pageName: string,
	page: CmsPageContent
): Promise<void> => {
	try {
		const cacheKey = `${faststore}_${contentType}_${pageName}`
		Eitri.sharedStorage.setItemJson(cacheKey, { cachedIn: new Date().toISOString(), ...page })
	} catch (error) {
		console.error('Error trying save in cache', error)
	}
}

export const filterRemoteConfigContent = async (cmsPageContent: CmsPageContent | null): Promise<CmsPageContent | null> => {
	if (!cmsPageContent) return null

	try {
		const remoteConfigKeys = extractRemoteConfigKeys(cmsPageContent)
		const remoteConfigMap = await fetchRemoteConfigs(remoteConfigKeys)

		return {
			...cmsPageContent,
			sections: filterSectionsByRemoteConfig(cmsPageContent.sections ?? [], remoteConfigMap)
		}
	} catch (error) {
		console.error('Error filtering remote config content:', error)
		return cmsPageContent
	}
}

const extractRemoteConfigKeys = (cmsPageContent: CmsPageContent): string[] => {
	const keys = new Set<string>()

	;(cmsPageContent.sections ?? []).forEach(section => {
		if (section.data?.remoteConfigKey) {
			keys.add(section.data.remoteConfigKey)
		}

		if (section.name === 'MultipleImageBanner') {
			section.data?.images?.forEach(image => {
				if (image?.remoteConfigKey) {
					keys.add(image.remoteConfigKey)
				}
			})
		}
	})

	return Array.from(keys)
}

const fetchRemoteConfigs = async (keys: string[]): Promise<Record<string, unknown>> => {
	try {
		const results = await Promise.all(keys.map(getFbRemoteConfig))
		return results.reduce<Record<string, unknown>>((acc, result, index) => {
			acc[keys[index]] = result ?? false
			return acc
		}, {})
	} catch (error) {
		console.error('Error fetching remote configs:', error)
		return {}
	}
}

const filterSectionsByRemoteConfig = (sections: CmsSection[], remoteConfigMap: Record<string, unknown>): CmsSection[] => {
	return sections.filter(section => {
		if (section.data?.remoteConfigKey && !remoteConfigMap[section.data.remoteConfigKey]) {
			return false
		}

		if (section.name === 'MultipleImageBanner' && section.data) {
			section.data.images = section.data.images?.filter(
				image => !(image?.remoteConfigKey && !remoteConfigMap[image.remoteConfigKey])
			)
		}

		return true
	})
}
