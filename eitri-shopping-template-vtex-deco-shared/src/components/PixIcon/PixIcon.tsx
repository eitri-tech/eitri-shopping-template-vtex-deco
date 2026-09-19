import { Image } from 'eitri-luminus'
import pixIcon from '../../assets/icons/pix.png'

interface PixIconProps {
	className?: string
	size?: number | string
}

export default function PixIcon(props: PixIconProps) {
	const { className, size } = props
	return (
		<Image
			src={pixIcon}
			width={size || 24}
			height={size || 24}
			className={className || 'object-contain'}
		/>
	)
}
