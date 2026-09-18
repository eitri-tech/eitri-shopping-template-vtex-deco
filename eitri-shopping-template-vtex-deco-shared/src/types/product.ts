/**
 * Tipagem de domínio (VTEX) usada pelo ProductCard/ShelfOfProducts e serviços.
 * Modelo intencionalmente leve — cobre o que os componentes acessam; campos
 * extras da VTEX ficam liberados via index signature.
 */

export interface Installment {
	NumberOfInstallments: number
	Value: number
	InterestRate: number
}

export interface CommertialOffer {
	Price: number
	ListPrice: number
	spotPrice: number
	AvailableQuantity?: number
	Installments?: Installment[]
	teasers?: Array<{ name: string; [key: string]: any }>
	[key: string]: any
}

export interface Seller {
	sellerDefault?: boolean
	commertialOffer: CommertialOffer
	[key: string]: any
}

export interface Sku {
	itemId: string
	name?: string
	images?: Array<{ imageUrl: string; [key: string]: any }>
	sellers: Seller[]
	[key: string]: any
}

export interface Product {
	productId: string
	productName: string
	items: Sku[]
	properties?: Array<{ name: string; values: string[]; [key: string]: any }>
	productClusters?: Array<{ id: string; [key: string]: any }>
	[key: string]: any
}

export interface CartItem {
	id: string
	quantity: number
	index?: number
	[key: string]: any
}

export interface Cart {
	items?: CartItem[]
	[key: string]: any
}
