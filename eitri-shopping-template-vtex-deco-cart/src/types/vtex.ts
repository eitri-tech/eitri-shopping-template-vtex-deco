export interface VtexAddress {
	addressId?: string
	addressType?: string
	receiverName?: string
	street?: string
	number?: string | null
	neighborhood?: string
	city?: string
	state?: string
	country?: string
	postalCode?: string
	complement?: string | null
	reference?: string | null
	geoCoordinates?: number[]
	isDisposable?: boolean
	addressQuery?: string
	[key: string]: unknown
}

export interface VtexSla {
	id: string
	itemIndex?: number
	deliveryChannel: string
	price: number
	shippingEstimate: string
	[key: string]: unknown
}

export interface VtexLogisticsInfo {
	itemIndex: number
	addressId?: string
	selectedSla?: string
	selectedDeliveryChannel?: string
	slas: VtexSla[]
	[key: string]: unknown
}

export interface VtexShippingData {
	logisticsInfo?: VtexLogisticsInfo[]
	selectedAddresses?: VtexAddress[]
	address?: VtexAddress
	[key: string]: unknown
}

export interface VtexOffering {
	id: string
	name?: string
	price?: number
	[key: string]: unknown
}

export interface VtexCartItem {
	id?: string
	uniqueId?: string
	productId?: string
	name?: string
	quantity: number
	imageUrl?: string
	price?: number
	sellingPrice?: number
	availability?: string
	seller?: string
	ean?: string
	bundleItems?: Array<{ id: string; [key: string]: unknown }>
	offerings?: VtexOffering[]
	priceDefinition?: { total?: number; calculatedSellingPrice?: number; [key: string]: unknown }
	additionalInfo?: { brandName?: string; [key: string]: unknown }
	[key: string]: unknown
}

export interface VtexInstallment {
	count: number
	[key: string]: unknown
}

export interface VtexInstallmentOption {
	installments: VtexInstallment[]
	[key: string]: unknown
}

export interface VtexTotalizer {
	id: string
	name?: string
	value: number
	[key: string]: unknown
}

export interface VtexMessage {
	code?: string
	text: string
	fields?: { ean?: string; [key: string]: unknown }
	[key: string]: unknown
}

export interface VtexCart {
	orderFormId?: string
	items: VtexCartItem[]
	totalizers?: VtexTotalizer[]
	shippingData?: VtexShippingData
	marketingData?: { coupon?: string; [key: string]: unknown }
	openTextField?: { value?: string; [key: string]: unknown }
	paymentData?: { installmentOptions?: VtexInstallmentOption[]; [key: string]: unknown }
	messages?: VtexMessage[]
	value?: number
	[key: string]: unknown
}

export interface VtexCartSimulationItem {
	id?: string
	quantity?: number
	seller?: string
	[key: string]: unknown
}
