import { PiHeartStraightLight, PiHeartStraightFill } from 'react-icons/pi'

interface WishlistIconProps {
	filled?: boolean
	className?: string
	size?: number | string
}

export default function WishlistIcon(props: WishlistIconProps) {
	const { filled, className, size } = props

	if (filled) {
		return (
			<PiHeartStraightFill
				className={className || 'text-black'}
				size={size || 26}
			/>
		)
	} else {
		return (
			<PiHeartStraightLight
				className={className || 'text-primary'}
				size={size || 26}
			/>
		)
	}
}
