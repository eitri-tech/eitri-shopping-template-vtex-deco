import { Text, View } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import { IoBagOutline } from 'react-icons/io5'

export default function HeaderCart(props) {
	const { quantityOfItems, onClick, cart } = props

	const [_quantityOfItems, setQuantityOfItems] = useState(quantityOfItems ?? 0)

	useEffect(() => {
		if (cart) {
			const itemsQuantity = cart.items.reduce((acc, item) => acc + item.quantity, 0)
			setQuantityOfItems(itemsQuantity)
		}
	}, [cart])

	const handlePress = () => {
		if (onClick) {
			onClick()
			return
		} else {
			Eitri.nativeNavigation.open({
				slug: 'cart'
			})
		}
	}

	return (
		<View
			className={`relative w-[25px] h-[25px] flex items-center`}
			onClick={handlePress}>
			<View>
				<IoBagOutline
					className='text-header-content'
					size={24}
				/>
			</View>

			{_quantityOfItems > 0 && (
				<View
					className={`absolute top-[-8px] right-[-8px] flex rounded-full w-5 h-5 justify-center items-center bg-header-content`}>
					<Text className='text-[12px] font-bold text-header-background'>{_quantityOfItems}</Text>
				</View>
			)}
		</View>
	)
}
