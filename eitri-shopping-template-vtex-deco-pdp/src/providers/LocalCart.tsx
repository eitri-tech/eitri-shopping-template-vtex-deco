import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { addItemToCart, changeItemQuantity, getCart, removeCartItem } from '../services/cartService'
import type { VtexCart } from '../types/vtex'

interface LocalCartContextValue {
	setCart: (cart: VtexCart | null) => void
	startCart: () => Promise<void>
	cart: VtexCart | null
	cartIsLoading: boolean
	addItem: (payload: unknown) => Promise<void>
	removeItem: (itemId: number) => Promise<void>
	changeItemQuantity: (index: number, newQuantity: number) => Promise<void>
}

const LocalCart = createContext<LocalCartContextValue>({} as LocalCartContextValue)

export default function CartProvider({ children }: { children?: ReactNode }) {
	const [cart, setCart] = useState<VtexCart | null>(null)
	const [cartIsLoading, setCartInLoading] = useState(false)

	const executeCartOperation = async (operation: (...args: any[]) => Promise<unknown>, ...args: any[]) => {
		setCartInLoading(true)
		const newCart = (await operation(...args)) as VtexCart | undefined
		if (newCart) {
			setCart(newCart)
		}
		setCartInLoading(false)
	}

	const startCart = async () => {
		return executeCartOperation(getCart)
	}

	const addItem = async (payload: unknown) => {
		return executeCartOperation(addItemToCart, payload)
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
