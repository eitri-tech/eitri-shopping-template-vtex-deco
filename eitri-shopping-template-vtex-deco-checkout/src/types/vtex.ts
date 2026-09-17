export interface VtexAddress {
	addressId?: string
	addressType?: string
	street?: string
	number?: string | null
	complement?: string
	neighborhood?: string
	city?: string
	state?: string
	postalCode?: string
	[key: string]: unknown
}

export interface VtexBusinessHour {
	DayOfWeek?: number
	OpeningTime?: string
	ClosingTime?: string
	[key: string]: unknown
}

export interface VtexPickupStoreInfo {
	address?: VtexAddress
	friendlyName?: string
	businessHours?: VtexBusinessHour[]
	[key: string]: unknown
}

export interface VtexSla {
	id: string
	name?: string
	price?: number
	shippingEstimate?: string
	shippingEstimateDate?: string
	deliveryChannel?: string
	pickupStoreInfo?: VtexPickupStoreInfo
	selected?: boolean
	[key: string]: unknown
}

export interface VtexLogisticsInfo {
	itemIndex?: number
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

export interface VtexInstallmentOption {
	paymentSystem?: string
	installments?: Array<{
		count?: number
		value?: number
		total?: number
		hasInterestRate?: boolean
		[key: string]: unknown
	}>
	[key: string]: unknown
}

export interface VtexPaymentSystem {
	id?: string | number
	stringId?: string
	name?: string
	groupName?: string
	[key: string]: unknown
}

export interface VtexPaymentData {
	payments?: Array<{ paymentSystem?: string; [key: string]: unknown }>
	paymentSystems?: VtexPaymentSystem[]
	installmentOptions?: VtexInstallmentOption[]
	giftCards?: unknown[]
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
	additionalInfo?: { brandName?: string; [key: string]: unknown }
	[key: string]: unknown
}

export interface VtexTotalizer {
	id: string
	name?: string
	value: number
	[key: string]: unknown
}

export interface VtexCart {
	orderFormId?: string
	canEditData?: boolean
	ratesAndBenefitsData?: {
		rateAndBenefitsIdentifiers?: Array<{ name?: string; [key: string]: unknown }>
		[key: string]: unknown
	}
	items: VtexCartItem[]
	shippingData?: VtexShippingData
	paymentData?: VtexPaymentData
	totalizers?: VtexTotalizer[]
	value?: number
	marketingData?: { coupon?: string; [key: string]: unknown }
	storePreferencesData?: { currencyCode?: string; [key: string]: unknown }
	clientProfileData?: {
		email?: string
		firstName?: string
		lastName?: string
		document?: string
		phone?: string
		[key: string]: unknown
	}
	[key: string]: unknown
}

/** One entry of the `payments` array sent to VTEX's select-payment endpoint. */
export interface VtexPaymentPayload {
	paymentSystem?: string | number
	installments?: number | string
	installmentsInterestRate?: number
	referenceValue?: number
	value?: number
	hasDefaultBillingAddress?: boolean
	bin?: string | null
	accountId?: string | null
	tokenId?: string | null
	isLuhnValid?: boolean
	isRegexValid?: boolean
	[key: string]: unknown
}

export type OnSelectPaymentMethod = (payments: VtexPaymentPayload[]) => Promise<unknown>

/** Local (client-side) record of the payment group the user picked — kept in LocalCart. */
export interface CheckoutSelectedPayment {
	groupName?: string
	paymentSystem?: VtexPaymentSystem
	payload?: VtexPaymentPayload
	isReadyToPay?: boolean
	[key: string]: unknown
}

/** Card data captured by the card forms / Google Pay — kept in LocalCart, never persisted. */
export interface CheckoutCardInfo {
	cardNumber?: string
	holderName?: string
	dueDate?: string
	validationCode?: string
	metadata?: string
	[key: string]: unknown
}

/** An external payment provider declared under `appConfigs.externalPayments` in remote config. */
export interface CheckoutExternalPayment {
	externalGroupName?: string
	name?: string
	imageUrl?: string
	description?: string
	[key: string]: unknown
}
