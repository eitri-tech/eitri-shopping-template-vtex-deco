import { PiHeartStraightLight, PiHeartStraightFill } from 'react-icons/pi'

export default function WishlistIcon(props) {
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
