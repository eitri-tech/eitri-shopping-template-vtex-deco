import CartItem from '../CartItem/CartItem'
import { useLocalShoppingCart } from '../../providers/LocalCart'
import { TrackingService } from 'eitri-shopping-template-vtex-deco-shared'

export default function CartItemsContent(props) {
	const { cart, changeQuantity, removeItem, addItemOffer, removeItemOffer } = useLocalShoppingCart()

	const [cartItems, setCartItems] = useState([])

	useEffect(() => {
		if (cart) {
			setCartItems([...cart?.items])
		}
	}, [cart])

	const hasMessage = itemEan => {
		let message = cart.messages.filter(item => item.code === 'withoutStock' && item.fields.ean == itemEan)
		return message[0] || null
	}

	const onChangeQuantityItem = async (quantity, index) => {
		await changeQuantity(index, quantity)
	}

	const handleRemoveCartItem = async index => {
		try {
			setCartItems([...cartItems.slice(0, index), ...cartItems.slice(index + 1)])
			await removeItem(index)
			TrackingService.removeFromCartEvent(cart, index)
		} catch (error) {
			console.error('Cart: handleRemoveCartItem Error', error)
		}
	}

	const onAddOfferingToCart = async (itemIndex, offeringId) => {
		await addItemOffer(itemIndex, offeringId)
	}

	const onRemoveOfferingFromCart = async (itemIndex, offeringId) => {
		await removeItemOffer(itemIndex, offeringId)
	}

	return (
		<View className='px-4 flex flex-col gap-4'>
			{cartItems?.map((item, index) => (
				<CartItem
					key={item.uniqueId}
					item={item}
					onChangeQuantityItem={newQuantity => onChangeQuantityItem(newQuantity, index)}
					message={hasMessage(item.ean)}
					handleRemoveCartItem={() => handleRemoveCartItem(index)}
					onAddOfferingToCart={offeringId => onAddOfferingToCart(index, offeringId)}
					onRemoveOfferingFromCart={offeringId => onRemoveOfferingFromCart(index, offeringId)}
				/>
			))}
		</View>
	)
}
