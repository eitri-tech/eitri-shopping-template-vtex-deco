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

export interface VtexDeliveryId {
	courierId?: string
	warehouseId?: string
	dockId?: string
	courierName?: string
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
	pickupPointId?: string
	pickupDistance?: number
	deliveryIds?: VtexDeliveryId[]
	selected?: boolean
	isPickupInPoint?: boolean
	isFaster?: boolean
	isCheaper?: boolean
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
	pickupPoints?: Array<{ id?: string; businessHours?: unknown; [key: string]: unknown }>
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
	productId?: string
	name?: string
	productName?: string
	nameComplete?: string
	quantity?: number
	imageUrl?: string
	price?: number
	sellingPrice?: number
	productCategories?: Record<string, string>
	productCategoryIds?: string
	categories?: string[]
	categoriesIds?: string[]
	additionalInfo?: { brandName?: string; [key: string]: unknown }
	[key: string]: unknown
}

export interface VtexCart {
	orderFormId?: string
	items: VtexCartItem[]
	shippingData?: VtexShippingData
	totalizers?: VtexTotalizer[]
	value?: number
	marketingData?: { coupon?: string; [key: string]: unknown }
	storePreferencesData?: { currencyCode?: string; [key: string]: unknown }
	paymentData?: {
		payments?: Array<{ paymentSystem?: string; [key: string]: unknown }>
		paymentSystems?: Array<{ stringId?: string; name?: string; [key: string]: unknown }>
		[key: string]: unknown
	}
	[key: string]: unknown
}

export interface VtexCommertialOffer {
	Price?: number
	AvailableQuantity?: number
	Teaser?: unknown[]
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

export interface VtexProduct {
	productId?: string
	productName?: string
	brand?: string
	categoryTree?: VtexCategoryTreeNode[]
	productClusters?: VtexCategoryTreeNode[]
	items?: VtexSku[]
	[key: string]: unknown
}
