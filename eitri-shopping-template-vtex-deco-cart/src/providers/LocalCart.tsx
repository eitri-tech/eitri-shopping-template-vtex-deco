import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { setNewAddress, setLogisticInfo } from '../services/freigthService'
import {
	getCart,
	addCoupon,
	addItemOffer,
	addItemToCart,
	changeItemQuantity,
	removeCartItem,
	removeCoupon,
	removeItemOffer
} from '../services/cartService'
import type { VtexCart } from '../types/vtex'

interface LocalCartContextValue {
	setCart: (cart: VtexCart | null) => void
	startCart: () => Promise<VtexCart | undefined>
	cart: VtexCart | null
	cartIsLoading: boolean | null
	addItem: (payload: Record<string, unknown>) => Promise<VtexCart | undefined>
	addItemOffer: (itemIndex: number, offeringId: string) => Promise<VtexCart | undefined>
	removeItemOffer: (itemIndex: number, offeringId: string) => Promise<VtexCart | undefined>
	changeQuantity: (index: number, newQuantity: number) => Promise<VtexCart | undefined>
	removeItem: (index: number) => Promise<VtexCart | undefined>
	setNewAddress: (cart: VtexCart, zipCode: string) => Promise<unknown>
	removeCoupon: () => Promise<VtexCart | undefined>
	setLogisticInfo: (payload: unknown) => Promise<unknown>
	addCoupon: (coupon: string) => Promise<VtexCart | undefined>
}

const LocalCart = createContext<Partial<LocalCartContextValue>>({})

interface CartProviderProps {
	children?: ReactNode
}

// executeCartOperation only updates local state when the operation resolves with a cart object —
// operations that return void (e.g. addItemToCart, since Vtex.cart.addItem's real signature
// returns void) won't refresh `cart` here. Pre-existing behavior, unchanged by this conversion.
export default function CartProvider(props: CartProviderProps) {
	const { children } = props
	const [cart, setCart] = useState<VtexCart | null>(null)
	const [cartIsLoading, setCartInLoading] = useState<boolean | null>(null)

	const executeCartOperation = async (
		operation: (...args: any[]) => Promise<VtexCart | void>,
		...args: any[]
	): Promise<VtexCart | undefined> => {
		setCartInLoading(true)
		const newCart = await operation(...args)
		if (newCart) {
			setCart(newCart)
		}
		setCartInLoading(false)
		return newCart || undefined
	}

	const startCart = async () => {
		return executeCartOperation(getCart)
	}

	const addItem = async (payload: Record<string, unknown>) => {
		return executeCartOperation(addItemToCart, payload)
	}

	const _addItemOffer = async (itemIndex: number, offeringId: string) => {
		return executeCartOperation(addItemOffer, itemIndex, offeringId)
	}

	const _removeItemOffer = async (itemIndex: number, offeringId: string) => {
		return executeCartOperation(removeItemOffer, itemIndex, offeringId)
	}

	const changeQuantity = async (index: number, newQuantity: number) => {
		return executeCartOperation(changeItemQuantity, index, newQuantity)
	}

	const removeItem = async (index: number) => {
		return executeCartOperation(removeCartItem, index)
	}

	const _setNewAddress = async (cart: VtexCart, zipCode: string) => {
		return executeCartOperation(setNewAddress, cart, zipCode)
	}

	// Only ever called with a single payload object (see Freight.tsx) — the original JS named
	// these params (cart, zipCode) but setLogisticInfo(payload) only reads the first argument.
	const _setLogisticInfo = async (payload: unknown) => {
		return executeCartOperation(setLogisticInfo, payload)
	}

	const _removeCoupon = async () => {
		return executeCartOperation(removeCoupon)
	}

	const _addCoupon = async (coupon: string) => {
		return executeCartOperation(addCoupon, coupon)
	}

	return (
		<LocalCart.Provider
			value={{
				setCart,
				startCart,
				cart,
				cartIsLoading,
				addItem,
				addItemOffer: _addItemOffer,
				removeItemOffer: _removeItemOffer,
				changeQuantity,
				removeItem,
				setNewAddress: _setNewAddress,
				removeCoupon: _removeCoupon,
				setLogisticInfo: _setLogisticInfo,
				addCoupon: _addCoupon
			}}>
			{children}
		</LocalCart.Provider>
	)
}

export function useLocalShoppingCart() {
	const context = useContext(LocalCart)

	return context
}
