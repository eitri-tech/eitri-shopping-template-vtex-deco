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

const LocalCart = createContext({})

export default function CartProvider({ children }) {
	const [cart, setCart] = useState(null)
	const [cartIsLoading, setCartInLoading] = useState(null)

	const executeCartOperation = async (operation, ...args) => {
		setCartInLoading(true)
		const newCart = await operation(...args)
		if (newCart) {
			setCart(newCart)
		}
		setCartInLoading(false)
		return newCart
	}

	const startCart = async () => {
		return executeCartOperation(getCart)
	}

	const addItem = async payload => {
		return executeCartOperation(addItemToCart, payload)
	}

	const _addItemOffer = async (itemIndex, offeringId) => {
		return executeCartOperation(addItemOffer, itemIndex, offeringId)
	}

	const _removeItemOffer = async (itemIndex, offeringId) => {
		return executeCartOperation(removeItemOffer, itemIndex, offeringId)
	}

	const changeQuantity = async (index, newQuantity) => {
		return executeCartOperation(changeItemQuantity, index, newQuantity)
	}

	const removeItem = async index => {
		return executeCartOperation(removeCartItem, index)
	}

	const _setNewAddress = async (cart, zipCode) => {
		return executeCartOperation(setNewAddress, cart, zipCode)
	}

	const _setLogisticInfo = async (cart, zipCode) => {
		return executeCartOperation(setLogisticInfo, cart, zipCode)
	}

	const _removeCoupon = async () => {
		return executeCartOperation(removeCoupon)
	}

	const _addCoupon = async coupon => {
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
