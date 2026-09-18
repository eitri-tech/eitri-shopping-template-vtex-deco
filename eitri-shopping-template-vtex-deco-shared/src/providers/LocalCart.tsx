import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import Eitri from 'eitri-bifrost'
import { getCart, addItemToCart, removeCartItem, updateItemOnCart } from '../services/CartService'
import { EventBusChannels, EventBus } from 'eitri-shopping-vtex-shared'
import { getCartTabBadgeIndex } from '../utils/versionCheck'
import type { Cart } from '../types/product'

export interface LocalCartContextValue {
	setCart: (cart: Cart | null) => void
	startCart: () => Promise<Cart | null>
	cart: Cart | null
	cartIsLoading: boolean
	addItem: (payload: any) => Promise<Cart | null>
	removeItem: (itemId: any) => Promise<Cart | null>
	updateItemQuantity: (index: number, quantity: number) => Promise<Cart | null>
}

const LocalCart = createContext<Partial<LocalCartContextValue>>({})

export default function CartProvider({ children }: { children: ReactNode }) {
	const [cart, setCart] = useState<Cart | null>(null)
	const [cartIsLoading, setCartInLoading] = useState(false)

	useEffect(() => {
		EventBus.subscribe({
			channel: EventBusChannels.ADD_TO_CART,
			broadcast: true,
			callback: startCart
		})
		EventBus.subscribe({
			channel: EventBusChannels.UPDATE_CART_ITEM,
			broadcast: true,
			callback: startCart
		})
	}, [])

	const updateTabBadge = async (newCart?: Cart | null) => {
		try {
			const tabIndex = await getCartTabBadgeIndex()

			Eitri.bottomBar.updateTabBadge({
				index: tabIndex,
				content: newCart?.items?.length
					? `${newCart?.items?.reduce((acc, item) => acc + item.quantity, 0)}`
					: null
			})
		} catch (e) {
			console.log('Erro ao atualizar tab badge: ', e)
		}
	}

	const executeCartOperation = async (
		operation: (...args: any[]) => Promise<Cart | null>,
		...args: any[]
	): Promise<Cart | null> => {
		try {
			setCartInLoading(true)
			const newCart = await operation(...args)
			updateTabBadge(newCart)
			setCart(newCart)
			setCartInLoading(false)
			return newCart
		} catch (e) {
			setCartInLoading(false)
			return cart
		}
	}

	const startCart = async () => {
		return executeCartOperation(getCart)
	}

	const addItem = async (payload: any) => {
		return executeCartOperation(addItemToCart, payload)
	}

	const removeItem = async (itemId: any) => {
		return executeCartOperation(removeCartItem, itemId)
	}

	const updateItemQuantity = async (index: number, quantity: number) => {
		return executeCartOperation(updateItemOnCart, index, quantity)
	}

	return (
		<LocalCart.Provider
			value={{
				setCart,
				startCart,
				cart,
				cartIsLoading,
				addItem,
				removeItem,
				updateItemQuantity
			}}>
			{children}
		</LocalCart.Provider>
	)
}

export function useLocalShoppingCart(): LocalCartContextValue {
	return useContext(LocalCart) as LocalCartContextValue
}
