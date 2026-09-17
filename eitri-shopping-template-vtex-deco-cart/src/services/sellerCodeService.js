import Eitri from 'eitri-bifrost'

// TODO: replace with your VTEX account name
const VTEX_ACCOUNT = 'YOUR_VTEX_ACCOUNT'

export const getSellerConfig = async () => {
	const rc = await Eitri.environment.getRemoteConfigs()
	return rc?.appConfigs?.cart?.sellerCode || null
}

export const lookupSellerCode = async (code, config) => {
	const { masterDataEntity, searchField, responseFields } = config
	const url = `https://www.${VTEX_ACCOUNT}.com.br/api/dataentities/${masterDataEntity}/search?_fields=${responseFields}&${searchField}=${encodeURIComponent(code)}&an=${VTEX_ACCOUNT}`
	const res = await Eitri.http.get(url, { Accept: 'application/json' })
	const data = Array.isArray(res?.data) ? res.data : []
	return data.length > 0 ? data[0] : null
}

export const buildPartIdentifier = (config, vendor, code) => {
	return (config.partIdentifierTemplate || '')
		.replace(/\{code\}/g, code)
		.replace(/\{name\}/g, vendor?.name || '')
}

export const updateMarketingDataForVendor = async (cart, config) => {
	const orderFormId = cart?.orderFormId
	if (!orderFormId) return null
	const payload = { ...(cart?.marketingData || {}), utmiCampaign: config.campaignIdentifier }
	const url = `https://www.${VTEX_ACCOUNT}.com.br/api/checkout/pub/orderForm/${orderFormId}/attachments/marketingData`
	const res = await Eitri.http.post(url, payload, {
		'Content-Type': 'application/json',
		Accept: 'application/json'
	})
	return res?.data ?? null
}
