import { getCart, addItemToCart, removeCartItem, updateItemOnCart } from '../services/CartService'
const LocalCart = createContext({})
export default function CartProvider({ children }) {
	const [cart, setCart] = useState(null)
	const [cartIsLoading, setCartInLoading] = useState(false)

	const executeCartOperation = async (operation, ...args) => {
		try {
			setCartInLoading(true)
			const newCart = await operation(...args)
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
	const addItem = async payload => {
		return executeCartOperation(addItemToCart, payload)
	}
	const removeItem = async itemId => {
		return executeCartOperation(removeCartItem, itemId)
	}
	const updateItemQuantity = async (index, quantity) => {
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
