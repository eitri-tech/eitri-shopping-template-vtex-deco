import { createContext, useContext, useState } from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import Eitri from 'eitri-bifrost'
import { getCartTabBadgeIndex } from 'eitri-shopping-template-vtex-deco-shared'
import {
	addItem,
	addUserData,
	generateNewCart,
	getCart,
	removeClientData,
	removeItemFromCart,
	selectPaymentOption,
	updateOpenTextField
} from '../services/cartService'
import setFreight, { setLogisticInfo, setNewAddress, setShippingAddress } from '../services/freigthService'
import type { VtexCart, CheckoutSelectedPayment, CheckoutCardInfo } from '../types/vtex'

interface CartContextValue {
	cart?: VtexCart | null
	setCart?: (cart: VtexCart | null) => void
	addPersonalData?: (userData: unknown, orderFormId?: unknown) => Promise<VtexCart>
	startCart?: () => Promise<VtexCart>
	setFreight?: (option: unknown) => Promise<VtexCart>
	setNewAddress?: (address: unknown) => Promise<VtexCart | undefined>
	addCustomerData?: (userData: unknown, orderFormId?: unknown) => Promise<VtexCart>
	selectPaymentOption?: (payload: unknown) => Promise<VtexCart>
	setShippingAddress?: (payload: unknown) => Promise<VtexCart>
	removeClientData?: (payload?: unknown) => Promise<VtexCart>
	setLogisticInfo?: (payload: unknown) => Promise<VtexCart>
	removeCartItem?: (index: number) => Promise<VtexCart>
	setPaymentOption?: (payload: unknown) => Promise<VtexCart>
	updateOpenTextField?: (receiver: unknown) => Promise<unknown>
	generateNewCart?: () => Promise<VtexCart>
	addItem?: (payload: unknown) => Promise<void>
	selectedPaymentData?: CheckoutSelectedPayment | null
	// These wrap the underlying `useState` setter directly (see below), so callers can pass
	// either a value or a `prev => next` updater — plain-callback typing rejected the latter.
	setSelectedPaymentData?: Dispatch<SetStateAction<CheckoutSelectedPayment | null>>
	cartIsLoading?: boolean | null
	cardInfo?: CheckoutCardInfo | null
	setCardInfo?: Dispatch<SetStateAction<CheckoutCardInfo | null>>
}

const LocalCart = createContext<CartContextValue>({})

interface CartProviderProps {
	children?: ReactNode
}

export default function CartProvider(props: CartProviderProps) {
	const { children } = props
	const [cart, setCart] = useState<VtexCart | null>(null)
	const [cartIsLoading, setCartIsLoading] = useState<boolean | null>(null)
	const [selectedPaymentData, setSelectedPaymentData] = useState<CheckoutSelectedPayment | null>(null)
	const [cardInfo, setCardInfo] = useState<CheckoutCardInfo | null>(null)

	// Eitri.bottomBar.updateTabBadge's content field is typed string | undefined (not | null),
	// but its own JSDoc says passing null or undefined removes the badge — undefined here is the
	// behaviorally-identical, honestly-typed choice (same pattern as home/pdp/cart's LocalCart).
	const updateTabBadge = async (newCart?: VtexCart | null) => {
		try {
			const tabIndex = await getCartTabBadgeIndex()
			const items = (newCart as VtexCart | undefined)?.items
			Eitri.bottomBar.updateTabBadge({
				index: tabIndex,
				content: items?.length ? `${items.reduce((acc: number, item) => acc + (item.quantity ?? 0), 0)}` : undefined
			})
		} catch (e) {
			console.log('Erro ao atualizar tab badge: ', e)
		}
	}

	const executeCartOperation = async <T,>(operation: (...args: any[]) => Promise<T>, ...args: any[]): Promise<T> => {
		setCartIsLoading(true)
		try {
			const newCart = await operation(...args)
			setCart(newCart as unknown as VtexCart)
			updateTabBadge(newCart as unknown as VtexCart)
			return newCart
		} catch (e) {
			console.error('[LocalCart] executeCartOperation failed:', e)
			throw e
		} finally {
			setCartIsLoading(false)
		}
	}

	const startCart = async () => {
		return executeCartOperation(getCart)
	}

	const _generateNewCart = async () => {
		return executeCartOperation(generateNewCart)
	}

	const _addItem = async (payload: unknown) => {
		return executeCartOperation(addItem, payload)
	}

	const addPersonalData = async (userData: unknown, orderFormId?: unknown) => {
		return executeCartOperation(addUserData, userData, orderFormId)
	}

	const _setFreight = async (option: unknown) => {
		return executeCartOperation(setFreight, option)
	}

	const _setNewAddress = async (address: unknown) => {
		return executeCartOperation(setNewAddress, address)
	}

	const addCustomerData = async (userData: unknown, orderFormId?: unknown) => {
		return executeCartOperation(addUserData, userData, orderFormId)
	}

	const _selectPaymentOption = async (payload: unknown) => {
		if ((cart?.paymentData?.giftCards?.length ?? 0) > 0) {
			await selectPaymentOption({
				payments: [],
				giftCards: []
			})
		}
		return executeCartOperation(selectPaymentOption, payload)
	}

	const _setShippingAddress = async (payload: unknown) => {
		return executeCartOperation(setShippingAddress, payload)
	}

	const _removeClientData = async (payload?: unknown) => {
		return executeCartOperation(removeClientData, payload)
	}

	const _setLogisticInfo = async (payload: unknown) => {
		return executeCartOperation(setLogisticInfo, payload)
	}

	const _removeCartItem = async (index: number) => {
		return executeCartOperation(removeItemFromCart, index)
	}

	const setPaymentOption = async (payload: unknown) => {
		return executeCartOperation(selectPaymentOption, payload)
	}

	const _updateOpenTextField = async (receiver: unknown) => {
		return executeCartOperation(updateOpenTextField, cart, receiver)
	}

	return (
		<LocalCart.Provider
			value={{
				cart,
				setCart,
				addPersonalData,
				startCart,
				setFreight: _setFreight,
				setNewAddress: _setNewAddress,
				addCustomerData,
				selectPaymentOption: _selectPaymentOption,
				setShippingAddress: _setShippingAddress,
				removeClientData: _removeClientData,
				setLogisticInfo: _setLogisticInfo,
				removeCartItem: _removeCartItem,
				setPaymentOption: setPaymentOption,
				updateOpenTextField: _updateOpenTextField,
				generateNewCart: _generateNewCart,
				addItem: _addItem,
				selectedPaymentData,
				setSelectedPaymentData,
				cartIsLoading,
				cardInfo,
				setCardInfo
			}}>
			{children}
		</LocalCart.Provider>
	)
}

export function useLocalShoppingCart() {
	const context = useContext(LocalCart)

	return context
}
