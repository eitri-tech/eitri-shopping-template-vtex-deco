import Eitri from 'eitri-bifrost'

// TODO: replace with your VTEX account name
const VTEX_ACCOUNT = 'YOUR_VTEX_ACCOUNT'

export interface SellerConfig {
	enabled?: boolean
	masterDataEntity?: string
	searchField?: string
	responseFields?: string
	partIdentifierTemplate?: string
	campaignIdentifier?: string
	[key: string]: unknown
}

export interface Vendor {
	name?: string
	cod?: string
	[key: string]: unknown
}

export interface Cart {
	orderFormId?: string
	marketingData?: Record<string, unknown>
	[key: string]: unknown
}

export const getSellerConfig = async (): Promise<SellerConfig | null> => {
	const rc = await Eitri.environment.getRemoteConfigs()
	return rc?.appConfigs?.cart?.sellerCode || null
}

export const lookupSellerCode = async (code: string, config: SellerConfig): Promise<any> => {
	const { masterDataEntity, searchField, responseFields } = config
	const url = `https://www.${VTEX_ACCOUNT}.com.br/api/dataentities/${masterDataEntity}/search?_fields=${responseFields}&${searchField}=${encodeURIComponent(code)}&an=${VTEX_ACCOUNT}`
	const res = await Eitri.http.get(url, { Accept: 'application/json' })
	const data = Array.isArray(res?.data) ? res.data : []
	return data.length > 0 ? data[0] : null
}

export const buildPartIdentifier = (config: SellerConfig, vendor: Vendor | null | undefined, code: string): string => {
	return (config.partIdentifierTemplate || '')
		.replace(/\{code\}/g, code)
		.replace(/\{name\}/g, vendor?.name || '')
}

export const updateMarketingDataForVendor = async (cart: Cart | null | undefined, config: SellerConfig): Promise<any> => {
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
