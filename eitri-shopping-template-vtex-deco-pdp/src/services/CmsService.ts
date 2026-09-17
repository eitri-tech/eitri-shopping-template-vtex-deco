import { Vtex } from 'eitri-shopping-vtex-shared'

export const hasLandingPageToSeller = async sellerId => {
	try {
		const { faststore } = Vtex.configs

		const result = await Vtex.cms.getPagesByContentTypes(faststore, 'landingPage', { 'filters[name]': sellerId })

		return !!result?.data?.[0]
	} catch (error) {
		return null
	}
}
