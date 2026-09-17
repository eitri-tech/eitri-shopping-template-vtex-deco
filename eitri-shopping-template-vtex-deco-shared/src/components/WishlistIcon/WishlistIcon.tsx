import { MdFavoriteBorder, MdFavorite } from 'react-icons/md'

interface WishlistIconProps {
	filled?: boolean
	className?: string
	size?: number | string
}

export default function WishlistIcon(props: WishlistIconProps) {
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
