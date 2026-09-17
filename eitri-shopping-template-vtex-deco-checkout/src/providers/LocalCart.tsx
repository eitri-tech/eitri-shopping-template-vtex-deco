import { createContext, useContext, useState } from 'react'
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

const LocalCart = createContext({})

export default function CartProvider({ children }) {
	const [cart, setCart] = useState(null)
	const [cartIsLoading, setCartIsLoading] = useState(null)
	const [selectedPaymentData, setSelectedPaymentData] = useState()
	const [cardInfo, setCardInfo] = useState()

	const executeCartOperation = async (operation, ...args) => {
		setCartIsLoading(true)
		const newCart = await operation(...args)
		setCart(newCart)
		setCartIsLoading(false)
		return newCart
	}

	const startCart = async () => {
		return executeCartOperation(getCart)
	}

	const _generateNewCart = async () => {
		return executeCartOperation(generateNewCart)
	}

	const _addItem = async payload => {
		return executeCartOperation(addItem, payload)
	}

	const addPersonalData = async (userData, orderFormId) => {
		return executeCartOperation(addUserData, userData, orderFormId)
	}

	const _setFreight = async option => {
		return executeCartOperation(setFreight, option)
	}

	const _setNewAddress = async address => {
		return executeCartOperation(setNewAddress, address)
	}

	const addCustomerData = async (userData, orderFormId) => {
		return executeCartOperation(addUserData, userData, orderFormId)
	}

	const _selectPaymentOption = async payload => {
		if (cart?.paymentData?.giftCards?.length > 0) {
			await selectPaymentOption({
				payments: [],
				giftCards: []
			})
		}
		return executeCartOperation(selectPaymentOption, payload)
	}

	const _setShippingAddress = async payload => {
		return executeCartOperation(setShippingAddress, payload)
	}

	const _removeClientData = async payload => {
		return executeCartOperation(removeClientData, payload)
	}

	const _setLogisticInfo = async payload => {
		return executeCartOperation(setLogisticInfo, payload)
	}

	const _removeCartItem = async index => {
		return executeCartOperation(removeItemFromCart, index)
	}

	const setPaymentOption = async payload => {
		return executeCartOperation(selectPaymentOption, payload)
	}

	const _updateOpenTextField = async (receiver) => {
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
