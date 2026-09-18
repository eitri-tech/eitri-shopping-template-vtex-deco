import { LuShoppingCart } from 'react-icons/lu'

interface ShoppingCartIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function ShoppingCartIcon(props: ShoppingCartIconProps) {
	const { className, size, ...rest } = props
	return (
		<LuShoppingCart
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
