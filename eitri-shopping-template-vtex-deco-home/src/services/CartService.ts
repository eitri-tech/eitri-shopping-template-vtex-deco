import { Vtex } from 'eitri-shopping-vtex-shared'
import { TrackingService } from 'eitri-shopping-template-vtex-deco-shared'
import type { VtexCart } from '../types/vtex'

interface AddItemParams {
	item: unknown
	salesChannel: string
	quantity: number
	seller: string
}

export const getCart = async (): Promise<VtexCart | undefined> => {
	try {
		return (await Vtex.cart.getCurrentOrCreateCart()) as VtexCart
	} catch (error) {
		console.log('Erro ao buscar carrinho', error)
	}
}

export const addItemToCart = async (skuItem: AddItemParams): Promise<void> => {
	try {
		return await Vtex.cart.addItem(skuItem)
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
