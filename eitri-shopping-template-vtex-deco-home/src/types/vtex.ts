export interface VtexAddress {
	addressId?: string
	addressType?: string
	street?: string
	number?: string
	neighborhood?: string
	city?: string
	state?: string
	postalCode?: string
	[key: string]: unknown
}

export interface VtexPickupStoreInfo {
	address?: VtexAddress
	friendlyName?: string
	businessHours?: unknown
	[key: string]: unknown
}

export interface VtexSla {
	id: string
	name?: string
	price: number
	shippingEstimate: string
	shippingEstimateDate?: string
	deliveryChannel: string
	pickupStoreInfo?: VtexPickupStoreInfo
	selected?: boolean
	isPickupInPoint?: boolean
	[key: string]: unknown
}

export interface VtexLogisticsInfo {
	itemIndex: number
	itemId?: string
	addressId?: string
	selectedSla?: string
	selectedDeliveryChannel?: string
	slas: VtexSla[]
	[key: string]: unknown
}

export interface VtexShippingData {
	logisticsInfo?: VtexLogisticsInfo[]
	selectedAddresses?: VtexAddress[]
	availableAddresses?: VtexAddress[]
	address?: VtexAddress
	[key: string]: unknown
}

export interface VtexTotalizer {
	id: string
	name?: string
	value: number
	[key: string]: unknown
}

export interface VtexCartItem {
	id?: string
	uniqueId?: string
	productId?: string
	name?: string
	quantity?: number
	imageUrl?: string
	price?: number
	sellingPrice?: number
	[key: string]: unknown
}

export interface VtexCart {
	orderFormId?: string
	items: VtexCartItem[]
	shippingData?: VtexShippingData
	totalizers?: VtexTotalizer[]
	value?: number
	marketingData?: { coupon?: string; [key: string]: unknown }
	[key: string]: unknown
}

export interface VtexInstallment {
	InterestRate?: number
	NumberOfInstallments?: number
	Value?: number
	[key: string]: unknown
}

export interface VtexTeaser {
	name?: string
	[key: string]: unknown
}

export interface VtexCommertialOffer {
	Price?: number
	ListPrice?: number
	AvailableQuantity?: number
	Installments?: VtexInstallment[]
	teasers?: VtexTeaser[]
	[key: string]: unknown
}

export interface VtexSeller {
	sellerId?: string
	sellerDefault?: boolean
	commertialOffer?: VtexCommertialOffer
	[key: string]: unknown
}

export interface VtexSkuVariation {
	name?: string
	values?: string[]
	[key: string]: unknown
}

export interface VtexSku {
	itemId?: string
	name?: string
	sellers?: VtexSeller[]
	images?: Array<{ imageUrl?: string; [key: string]: unknown }>
	variations?: VtexSkuVariation[]
	[key: string]: unknown
}

export interface VtexCategoryTreeNode {
	id?: string | number
	name?: string
	[key: string]: unknown
}

export interface VtexProductProperty {
	name?: string
	values?: string[]
	[key: string]: unknown
}

export interface VtexProduct {
	productId?: string
	productName?: string
	brand?: string
	categoryTree?: VtexCategoryTreeNode[]
	productClusters?: VtexCategoryTreeNode[]
	items?: VtexSku[]
	properties?: VtexProductProperty[]
	[key: string]: unknown
}

export interface VtexBadge {
	image?: string
	textBadge?: {
		text?: string
		bgColor?: string
		textColor?: string
		[key: string]: unknown
	}
	[key: string]: unknown
}

export interface CmsSection {
	name?: string
	data?: {
		type?: string
		values?: string[]
		startDate?: string
		endDate?: string
		remoteConfigKey?: string
		images?: Array<{ startDate?: string; endDate?: string; remoteConfigKey?: string; [key: string]: unknown }>
		[key: string]: unknown
	}
	[key: string]: unknown
}

export interface CmsPageContent {
	sections?: CmsSection[]
	settings?: Record<string, unknown>
	[key: string]: unknown
}
