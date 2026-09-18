import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import Eitri from 'eitri-bifrost'
import { getCartTabBadgeIndex } from 'eitri-shopping-template-vtex-deco-shared'
import { getCart, addItemToCart, removeCartItem, updateItemOnCart } from '../services/CartService'
import { EventBusChannels, EventBus } from 'eitri-shopping-vtex-shared'
import type { VtexCart } from '../types/vtex'

interface CartContextValue {
	setCart?: (cart: VtexCart | null) => void
	startCart?: () => Promise<VtexCart | undefined>
	cart?: VtexCart | null
	cartIsLoading?: boolean
	addItem?: (payload: Parameters<typeof addItemToCart>[0]) => Promise<VtexCart | undefined>
	removeItem?: (itemId: number) => Promise<VtexCart | undefined>
	updateItemQuantity?: (index: number, quantity: number) => Promise<VtexCart | undefined>
}

const LocalCart = createContext<CartContextValue>({})

interface CartProviderProps {
	children?: ReactNode
}

export default function CartProvider(props: CartProviderProps) {
	const { children } = props
	const [cart, setCart] = useState<VtexCart | null>(null)
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

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

	const executeCartOperation = async <TArgs extends unknown[]>(
		operation: (...args: TArgs) => Promise<VtexCart | undefined>,
		...args: TArgs
	): Promise<VtexCart | undefined> => {
		try {
			setCartInLoading(true)
			const newCart = await operation(...args)
			// BUG FOUND (pre-existing): called with no argument, so updateTabBadge always saw
			// `newCart` as undefined and rendered the badge as if the cart were always empty.
			// Fixed to pass the freshly-fetched cart through.
			updateTabBadge(newCart)
			setCart(newCart ?? null)
			setCartInLoading(false)
			return newCart
		} catch (e) {
			setCartInLoading(false)
			return cart ?? undefined
		}
	}

	const startCart = async () => {
		return executeCartOperation(getCart)
	}

	const addItem = async (payload: Parameters<typeof addItemToCart>[0]) => {
		// addItemToCart's real return is void; the cart is re-fetched elsewhere. Cast through
		// unknown since void and VtexCart|undefined don't structurally overlap.
		return executeCartOperation(
			addItemToCart as unknown as (...args: [typeof payload]) => Promise<VtexCart | undefined>,
			payload
		)
	}

	const removeItem = async (itemId: number) => {
		return executeCartOperation(removeCartItem as (...args: [number]) => Promise<VtexCart | undefined>, itemId)
	}

	const updateItemQuantity = async (index: number, quantity: number) => {
		return executeCartOperation(
			updateItemOnCart as (...args: [number, number]) => Promise<VtexCart | undefined>,
			index,
			quantity
		)
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
