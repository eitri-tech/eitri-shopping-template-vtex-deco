import Eitri from 'eitri-bifrost'
import { getCart, addItemToCart, removeCartItem, updateItemOnCart } from '../services/CartService'
const LocalCart = createContext({})
import { EventBusChannels, EventBus } from 'eitri-shopping-vtex-shared'

export default function CartProvider({ children }) {
	const [cart, setCart] = useState(null)
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

	const updateTabBadge = async newCart => {
		try {
			Eitri.bottomBar.updateTabBadge({
				index: 2,
				content: newCart?.items?.length
					? `${newCart?.items?.reduce((acc, item) => acc + item.quantity, 0)}`
					: null
			})
		} catch (e) {
			console.log('Erro ao atualizar tab badge: ', e)
		}
	}

	const executeCartOperation = async (operation, ...args) => {
		try {
			setCartInLoading(true)
			const newCart = await operation(...args)
			updateTabBadge()
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
