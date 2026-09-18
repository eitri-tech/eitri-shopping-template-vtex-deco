import { Vtex } from 'eitri-shopping-vtex-shared'

// The SDK's public addItem type only documents { item, salesChannel, quantity, seller } as
// required, but its real destructuring also accepts { id, itemId, sellers } — which is what this
// app actually passes (a raw SKU object + quantity, no explicit salesChannel/seller). Widening
// the accepted shape here instead of reshaping the working call site.
interface CartAddItemPayload {
	id?: string
	item?: unknown
	itemId?: string
	salesChannel?: string
	quantity?: number
	seller?: string
	sellers?: unknown
	[key: string]: unknown
}
const addItemToCartSdk = Vtex.cart.addItem as unknown as (payload: CartAddItemPayload) => Promise<unknown>
// Vtex.cart.addItems declares a required `salesChannel` second arg, but the runtime falls back to the
// configured channel when it's omitted — matching the existing single-arg call sites.
const addItemsToCartSdk = Vtex.cart.addItems as unknown as (items: unknown) => Promise<unknown>

export const getCart = async (): Promise<unknown> => {
	try {
		return await Vtex.cart.getCurrentOrCreateCart()
	} catch (error) {
		console.log('Erro ao buscar carrinho', error)
		// crashLog('Erro ao buscar carrinho', error)
	}
}

export const addItemToCart = async (item: CartAddItemPayload): Promise<unknown> => {
	try {
		return await addItemToCartSdk(item)
	} catch (error) {
		console.error('Erro ao adicionar item ao carrinho', error)
	}
}

export const addMultipleItemsToCart = async (items: unknown): Promise<unknown> => {
	try {
		return await addItemsToCartSdk(items)
	} catch (error) {
		console.error('Erro ao adicionar itens ao carrinho', error)
		throw error
	}
}

export const removeCartItem = async (index: number): Promise<unknown> => {
	try {
		return await Vtex.cart.removeItem(index)
	} catch (error) {
		console.log('Erro ao remover item do carrinho', error)
	}
}

export const saveCartIdOnStorage = async (cartId: string): Promise<unknown> => {
	return Vtex.cart.saveCartIdOnStorage(cartId)
}

export const changeItemQuantity = async (index: number, newQuantity: number): Promise<unknown> => {
	return Vtex.cart.changeItemQuantity(index, newQuantity)
}
