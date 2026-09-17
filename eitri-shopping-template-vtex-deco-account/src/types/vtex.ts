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
	itemIndex?: number
	selectedDeliveryChannel?: string
	deliveryCompany?: string
	shippingEstimateDate?: string
	[key: string]: unknown
}

export interface VtexPackageItem {
	itemIndex?: number
	quantity?: number
	price?: number
	[key: string]: unknown
}

export interface VtexPackage {
	trackingUrl?: string
	items?: VtexPackageItem[]
	courierStatus?: { finished?: boolean; deliveredDate?: string; [key: string]: unknown }
	[key: string]: unknown
}

export interface VtexOrder {
	orderId?: string
	status?: string
	statusDescription?: string
	value?: number
	totalValue?: number
	totalItems?: number
	creationDate?: string
	items?: VtexOrderItem[]
	shippingData?: { logisticsInfo?: VtexLogisticsInfo[]; address?: VtexAddress; [key: string]: unknown }
	packageAttachment?: { packages?: VtexPackage[]; [key: string]: unknown }
	totalizers?: Array<{ id: string; name?: string; value: number }>
	totals?: Array<{ id?: string; name?: string; value?: number; [key: string]: unknown }>
	paymentData?: { transactions?: Array<{ payments?: VtexOrderPayment[]; [key: string]: unknown }>; [key: string]: unknown }
	allowCancellation?: boolean
	[key: string]: unknown
}

export interface VtexOrderPayment {
	paymentSystem?: string
	paymentSystemName?: string
	value?: number
	installments?: number
	url?: string
	[key: string]: unknown
}

export interface VtexOrderItem {
	id?: string
	uniqueId?: string
	productId?: string
	skuId?: string
	name?: string
	quantity?: number
	price?: number
	sellingPrice?: number
	imageUrl?: string
	seller?: string
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
	id?: string
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
	// Real usage (SubscriptionDetails.jsx, SubscriptionCard.jsx) always reads frequency/id off
	// `subscription.plan`, never a top-level `frequency` — matches the shape here.
	plan?: { id?: string; frequency?: VtexFrequency; [key: string]: unknown }
	items?: VtexSubscriptionItem[]
	nextPurchaseDate?: string
	purchaseSettings?: {
		paymentMethod?: { paymentAccountId?: string; paymentSystem?: string; paymentSystemName?: string; [key: string]: unknown }
		[key: string]: unknown
	}
	shippingAddress?: { addressId?: string; addressType?: string; [key: string]: unknown }
	[key: string]: unknown
}

export interface VtexAssemblyOption {
	id?: string
	inputValues?: Array<{ label?: string; domain?: unknown[]; [key: string]: unknown }>
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
	spotPrice?: number
	AvailableQuantity?: number
	Installments?: VtexInstallment[]
	teasers?: Array<{ name?: string; [key: string]: unknown }>
	[key: string]: unknown
}

export interface VtexSeller {
	sellerDefault?: boolean
	commertialOffer?: VtexCommertialOffer
	[key: string]: unknown
}

export interface VtexSku {
	itemId?: string
	name?: string
	nameComplete?: string
	images?: Array<{ imageUrl?: string; [key: string]: unknown }>
	sellers?: VtexSeller[]
	variations?: Array<{ name?: string; values?: string[]; [key: string]: unknown }>
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
	name?: string
	brand?: string
	items?: VtexSku[]
	itemMetadata?: { items?: Array<{ assemblyOptions?: VtexAssemblyOption[]; [key: string]: unknown }> }
	productClusters?: Array<{ id?: string | number; [key: string]: unknown }>
	properties?: VtexProductProperty[]
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
	paymentSystem?: string
	paymentSystemName?: string
	isExpired?: boolean
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
