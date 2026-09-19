import { createContext, useContext, useState } from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import Eitri from 'eitri-bifrost'
import { getCartTabBadgeIndex } from 'eitri-shopping-template-vtex-deco-shared'
import { getCart, addItemToCart, removeCartItem, updateItemOnCart } from '../services/CartService'
import type { VtexCart } from '../types/vtex'

interface LocalCartContextValue {
	setCart?: Dispatch<SetStateAction<VtexCart | null>>
	startCart?: () => Promise<VtexCart | null | undefined>
	cart?: VtexCart | null
	cartIsLoading?: boolean
	addItem?: (payload: Parameters<typeof addItemToCart>[0]) => Promise<VtexCart | null | undefined>
	removeItem?: (itemId: number) => Promise<VtexCart | null | undefined>
	updateItemQuantity?: (index: number, quantity: number) => Promise<VtexCart | null | undefined>
}

const LocalCart = createContext<LocalCartContextValue>({})

interface CartProviderProps {
	children?: ReactNode
}

export default function CartProvider(props: CartProviderProps) {
	const { children } = props
	const [cart, setCart] = useState<VtexCart | null>(null)
	const [cartIsLoading, setCartInLoading] = useState(false)

	const updateTabBadge = async (newCart?: VtexCart) => {
		try {
			const tabIndex = await getCartTabBadgeIndex()
			Eitri.bottomBar.updateTabBadge({
				index: tabIndex,
				content: newCart?.items?.length
					? `${newCart?.items?.reduce((acc, item) => acc + (item.quantity ?? 0), 0)}`
					: undefined
			})
		} catch (e) {
			console.log('Erro ao atualizar tab badge: ', e)
		}
	}

	const executeCartOperation = async <T extends unknown[]>(
		operation: (...args: T) => Promise<VtexCart | undefined>,
		...args: T
	): Promise<VtexCart | null | undefined> => {
		try {
			setCartInLoading(true)
			const newCart = await operation(...args)
			updateTabBadge(newCart)
			setCart(newCart ?? null)
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
	const addItem = async (payload: Parameters<typeof addItemToCart>[0]) => {
		return executeCartOperation(addItemToCart, payload)
	}
	const removeItem = async (itemId: number) => {
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
export function useLocalShoppingCart() {
	const context = useContext(LocalCart)
	return context
}
