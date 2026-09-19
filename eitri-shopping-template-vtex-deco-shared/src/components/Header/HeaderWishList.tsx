import { View } from 'eitri-luminus'
import WishlistIcon from '../WishlistIcon/WishlistIcon'

interface HeaderWishListProps {
	filled?: boolean
	className?: string
	onClick?: () => void
}

export default function HeaderWishList(props: HeaderWishListProps) {
	const { filled, className, onClick } = props

	return (
		<View onClick={onClick}>
			<WishlistIcon
				filled={filled}
				className={className}
			/>
		</View>
	)
}
