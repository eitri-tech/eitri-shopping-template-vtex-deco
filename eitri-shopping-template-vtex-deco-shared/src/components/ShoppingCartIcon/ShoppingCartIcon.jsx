import { LuShoppingCart } from 'react-icons/lu'

export default function ShoppingCartIcon(props) {
	return (
		<LuShoppingCart
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
