import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import Eitri from 'eitri-bifrost'
import { getCartTabBadgeIndex } from 'eitri-shopping-template-vtex-deco-shared'
import {
	addItemToCart,
	addMultipleItemsToCart,
	changeItemQuantity,
	getCart,
	removeCartItem
} from '../services/cartService'
import type { VtexCart } from '../types/vtex'

interface LocalCartContextValue {
	setCart: (cart: VtexCart | null) => void
	startCart: () => Promise<VtexCart | undefined>
	cart: VtexCart | null
	cartIsLoading: boolean
	addItem: (payload: unknown) => Promise<VtexCart | undefined>
	addItems: (payload: unknown) => Promise<VtexCart | undefined>
	removeItem: (itemId: number) => Promise<VtexCart | undefined>
	changeItemQuantity: (index: number, newQuantity: number) => Promise<VtexCart | undefined>
}

const LocalCart = createContext<LocalCartContextValue>({} as LocalCartContextValue)

export default function CartProvider({ children }: { children?: ReactNode }) {
	const [cart, setCart] = useState<VtexCart | null>(null)
	const [cartIsLoading, setCartInLoading] = useState(false)

	const updateTabBadge = async (newCart: VtexCart) => {
		try {
			const tabIndex = await getCartTabBadgeIndex()
			const totalItems = (newCart?.items ?? []).reduce((acc, item) => acc + (item?.quantity ?? 0), 0)
			Eitri.bottomBar.updateTabBadge({
				index: tabIndex,
				content: totalItems > 0 ? `${totalItems}` : undefined
			})
		} catch (e) {
			console.log('Erro ao atualizar tab badge: ', e)
		}
	}

	const executeCartOperation = async (
		operation: (...args: any[]) => Promise<unknown>,
		...args: any[]
	): Promise<VtexCart | undefined> => {
		setCartInLoading(true)
		try {
			const newCart = (await operation(...args)) as VtexCart | undefined
			if (newCart) {
				setCart(newCart)
				updateTabBadge(newCart)
			}
			return newCart
		} finally {
			setCartInLoading(false)
		}
	}

	const startCart = async () => {
		return executeCartOperation(getCart)
	}

	const addItem = async (payload: unknown) => {
		return executeCartOperation(addItemToCart, payload)
	}

	const addMultipleItems = async (payload: unknown) => {
		return executeCartOperation(addMultipleItemsToCart, payload)
	}

	const removeItem = async (itemId: number) => {
		return executeCartOperation(removeCartItem, itemId)
	}

	const _changeItemQuantity = async (index: number, newQuantity: number) => {
		return executeCartOperation(changeItemQuantity, index, newQuantity)
	}

	return (
		<LocalCart.Provider
			value={{
				setCart,
				startCart,
				cart,
				cartIsLoading,
				addItem,
				addItems: addMultipleItems,
				removeItem,
				changeItemQuantity: _changeItemQuantity
			}}>
			{children}
		</LocalCart.Provider>
	)
}
export function useLocalShoppingCart() {
	const context = useContext(LocalCart)
	return context
}
