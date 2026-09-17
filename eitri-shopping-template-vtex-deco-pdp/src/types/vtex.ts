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

export interface VtexSla {
	id: string
	name?: string
	price: number
	shippingEstimate: string
	shippingEstimateDate?: string
	deliveryChannel: string
	pickupStoreInfo?: { address?: VtexAddress; friendlyName?: string; [key: string]: unknown }
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

export interface VtexCartItem {
	id?: string
	productId?: string
	name?: string
	productName?: string
	nameComplete?: string
	quantity?: number
	imageUrl?: string
	price?: number
	sellingPrice?: number
	[key: string]: unknown
}

export interface VtexCart {
	orderFormId?: string
	items: VtexCartItem[]
	shippingData?: {
		logisticsInfo?: VtexLogisticsInfo[]
		selectedAddresses?: VtexAddress[]
		address?: VtexAddress
		messages?: unknown
		[key: string]: unknown
	}
	messages?: Array<{ code?: string; [key: string]: unknown }>
	[key: string]: unknown
}

export interface VtexInstallment {
	NumberOfInstallments?: number
	Value?: number
	InterestRate?: number
	[key: string]: unknown
}

export interface VtexCommertialOffer {
	Price?: number
	ListPrice?: number
	PriceWithoutDiscount?: number
	AvailableQuantity?: number
	IsAvailable?: boolean
	Installments?: VtexInstallment[]
	[key: string]: unknown
}

export interface VtexSeller {
	sellerId?: string
	sellerName?: string
	sellerDefault?: boolean
	commertialOffer?: VtexCommertialOffer
	Price?: number
	ListPrice?: number
	PriceWithoutDiscount?: number
	AvailableQuantity?: number
	Installments?: VtexInstallment[]
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
	nameComplete?: string
	ean?: string
	isKit?: boolean
	sellers?: VtexSeller[]
	images?: Array<{ imageUrl?: string; imageText?: string; [key: string]: unknown }>
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

export interface VtexSpecificationGroup {
	originalName?: string
	specifications?: Array<{ name?: string; values?: string[]; [key: string]: unknown }>
	[key: string]: unknown
}

export interface VtexProduct {
	productId?: string
	productName?: string
	brand?: string
	productReference?: string
	description?: string
	categoryId?: string
	categoryTree?: VtexCategoryTreeNode[]
	productClusters?: VtexCategoryTreeNode[]
	items?: VtexSku[]
	itemMetadata?: { items?: Array<{ id?: string; MainImage?: string; [key: string]: unknown }> }
	properties?: VtexProductProperty[]
	specificationGroups?: VtexSpecificationGroup[]
	linkText?: string
	[key: string]: unknown
}
