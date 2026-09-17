import Eitri from 'eitri-bifrost'
import { getCartTabBadgeIndex } from 'eitri-shopping-template-vtex-deco-shared'
import { setNewAddress, setLogisticInfo } from '../services/freigthService'
import {
	getCart,
	addCoupon,
	addItemOffer,
	addItemToCart,
	changeItemQuantity,
	removeCartItem,
	removeCoupon,
	removeItemOffer,
	updateVendorInOpenTextField
} from '../services/cartService'
import { getSellerConfig, lookupSellerCode, buildPartIdentifier, updateMarketingDataForVendor } from '../services/sellerCodeService'

const LocalCart = createContext({})

export default function CartProvider({ children }) {
	const [cart, setCart] = useState(null)
	const [cartIsLoading, setCartInLoading] = useState(null)
	const [vendor, setVendor] = useState(null)

	const updateTabBadge = async newCart => {
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

	const executeCartOperation = async (operation, ...args) => {
		setCartInLoading(true)
		const newCart = await operation(...args)
		if (newCart) {
			setCart(newCart)
			updateTabBadge(newCart)
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

	const applySellerCode = async code => {
		const config = await getSellerConfig()
		if (!config?.enabled) throw new Error('DISABLED')

		const found = await lookupSellerCode(code, config)
		if (!found) throw new Error('NOT_FOUND')

		const vendorText = buildPartIdentifier(config, found, code)
		const newCart = await executeCartOperation(updateVendorInOpenTextField, cart, vendorText)

		try {
			await updateMarketingDataForVendor(newCart || cart, config)
			await executeCartOperation(getCart)
		} catch (e) {
			console.error('applySellerCode: marketingData update failed', e)
		}

		setVendor(found)
		return found
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
				addCoupon: _addCoupon,
				vendor,
				setVendor,
				applySellerCode
			}}>
			{children}
		</LocalCart.Provider>
	)
}

export function useLocalShoppingCart() {
	const context = useContext(LocalCart)

	return context
}
