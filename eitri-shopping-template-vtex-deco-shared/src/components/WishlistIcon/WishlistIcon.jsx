import { MdFavoriteBorder, MdFavorite } from 'react-icons/md'

export default function WishlistIcon(props) {
	const { filled, className, size } = props

	if (filled) {
		return (
			<MdFavorite
				className={className || 'text-primary'}
				size={size || 26}
			/>
		)
	} else {
		return (
			<MdFavoriteBorder
				className={className || 'text-primary'}
				size={size || 26}
			/>
		)
	}
}
