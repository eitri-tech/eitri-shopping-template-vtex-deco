import WishlistIcon from '../WishlistIcon/WishlistIcon'

export default function HeaderWishList(props) {
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
