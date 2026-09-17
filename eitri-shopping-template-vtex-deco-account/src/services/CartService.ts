import { Vtex } from 'eitri-shopping-vtex-shared'
import type { VtexCart } from '../types/vtex'

export const getCart = async (): Promise<VtexCart | undefined> => {
	try {
		return await Vtex.cart.getCurrentOrCreateCart()
	} catch (error) {
		console.log('Erro ao buscar carrinho', error)
	}
}

interface CartAddItemInput {
	id?: string
	item: unknown
	itemId?: string
	salesChannel: string
	quantity: number
	seller: string
	sellers?: unknown
}

export const addItemToCart = async (skuItem: CartAddItemInput): Promise<VtexCart | undefined> => {
	try {
		// The lib's .d.ts declares this call as Promise<void>, but callers (LocalCart provider)
		// have always used its resolved value as the updated cart — kept as-is via a cast rather
		// than silently changing the provider's cart-refresh behavior.
		return (await Vtex.cart.addItem(skuItem)) as unknown as VtexCart
	} catch (error) {
		console.error('Erro ao adicionar item ao carrinho', error)
	}
}

export const removeCartItem = async (index: number) => {
	try {
		return await Vtex.cart.removeItem(index)
	} catch (error) {
		console.error('Erro ao remover item ao carrinho', error)
	}
}

export const updateItemOnCart = async (index: number, quantity: number) => {
	try {
		return await Vtex.cart.changeItemQuantity(index, quantity)
	} catch (error) {
		console.error('Erro ao atualizar item ao carrinho', error)
	}
}
