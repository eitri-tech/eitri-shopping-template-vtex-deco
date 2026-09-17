import Eitri from 'eitri-bifrost'
import { getCartTabBadgeIndex } from 'eitri-shopping-template-vtex-deco-shared'
import {
	addItemToCart,
	addMultipleItemsToCart,
	changeItemQuantity,
	getCart,
	removeCartItem
} from '../services/cartService'
const LocalCart = createContext({})

export default function CartProvider({ children }) {
	const [cart, setCart] = useState(null)
	const [cartIsLoading, setCartInLoading] = useState(false)

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
		try {
			const newCart = await operation(...args)
			if (newCart) {
				setCart(newCart)
				updateTabBadge(newCart)
			}
			return newCart
		} finally {
			setCartInLoading(false)
		}
	}

	const startCart = async () => {
		return executeCartOperation(getCart)
	}

	const addItem = async payload => {
		return executeCartOperation(addItemToCart, payload)
	}

	const addMultipleItems = async payload => {
		return executeCartOperation(addMultipleItemsToCart, payload)
	}

	const removeItem = async itemId => {
		return executeCartOperation(removeCartItem, itemId)
	}

	const _changeItemQuantity = async (index, newQuantity) => {
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
				addItems: addMultipleItems,
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
