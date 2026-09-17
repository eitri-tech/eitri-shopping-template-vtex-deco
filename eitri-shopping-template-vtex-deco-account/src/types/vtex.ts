export interface VtexAddress {
	addressId?: string
	addressType?: string
	receiverName?: string
	street?: string
	number?: string
	complement?: string
	neighborhood?: string
	city?: string
	state?: string
	postalCode?: string
	country?: string
	reference?: string
	[key: string]: unknown
}

export interface VtexLogisticsInfo {
	selectedDeliveryChannel?: string
	[key: string]: unknown
}

export interface VtexPackage {
	courierStatus?: { finished?: boolean; [key: string]: unknown }
	[key: string]: unknown
}

export interface VtexOrder {
	orderId?: string
	status?: string
	value?: number
	creationDate?: string
	items?: VtexOrderItem[]
	shippingData?: { logisticsInfo?: VtexLogisticsInfo[]; address?: VtexAddress; [key: string]: unknown }
	packageAttachment?: { packages?: VtexPackage[]; [key: string]: unknown }
	totalizers?: Array<{ id: string; name?: string; value: number }>
	paymentData?: unknown
	[key: string]: unknown
}

export interface VtexOrderItem {
	id?: string
	productId?: string
	skuId?: string
	name?: string
	quantity?: number
	price?: number
	sellingPrice?: number
	imageUrl?: string
	[key: string]: unknown
}

export interface VtexOrderSummary {
	orderId?: string
	status?: string
	value?: number
	creationDate?: string
	[key: string]: unknown
}

export interface VtexFrequency {
	interval?: number
	periodicity?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | string
	[key: string]: unknown
}

export interface VtexSubscriptionItem {
	skuId?: string
	quantity?: number
	[key: string]: unknown
}

export interface VtexSubscriptionCycle {
	status?: string
	friendlyMessage?: string
	[key: string]: unknown
}

export interface VtexSubscription {
	id?: string
	title?: string
	status?: string
	frequency?: VtexFrequency
	items?: VtexSubscriptionItem[]
	nextPurchaseDate?: string
	[key: string]: unknown
}

export interface VtexAssemblyOption {
	id?: string
	inputValues?: Array<{ label?: string; domain?: unknown[]; [key: string]: unknown }>
	[key: string]: unknown
}

export interface VtexSku {
	itemId?: string
	name?: string
	nameComplete?: string
	images?: Array<{ imageUrl?: string; [key: string]: unknown }>
	sellers?: Array<{ sellerDefault?: boolean; commertialOffer?: { Price?: number; [key: string]: unknown }; [key: string]: unknown }>
	variations?: Array<{ name?: string; values?: string[]; [key: string]: unknown }>
	[key: string]: unknown
}

export interface VtexProduct {
	productId?: string
	productName?: string
	name?: string
	brand?: string
	items?: VtexSku[]
	itemMetadata?: { items?: Array<{ assemblyOptions?: VtexAssemblyOption[]; [key: string]: unknown }> }
	[key: string]: unknown
}

export interface VtexCustomerProfile {
	firstName?: string
	lastName?: string
	email?: string
	document?: string
	homePhone?: string
	gender?: string
	birthDate?: string
	corporateName?: string
	corporateDocument?: string
	businessPhone?: string
	stateRegistration?: string
	tradeName?: string
	isCorporate?: boolean
	[key: string]: unknown
}

export interface VtexSavedCard {
	id?: string
	cardNumber?: string
	bin?: string
	accountId?: string
	[key: string]: unknown
}

export interface VtexWishlistItem {
	id?: string
	productId?: string
	title?: string
	sku?: string
	[key: string]: unknown
}

export interface VtexCartItem {
	id?: string
	productId?: string
	name?: string
	quantity?: number
	price?: number
	sellingPrice?: number
	[key: string]: unknown
}

export interface VtexCart {
	orderFormId?: string
	items: VtexCartItem[]
	value?: number
	[key: string]: unknown
}
