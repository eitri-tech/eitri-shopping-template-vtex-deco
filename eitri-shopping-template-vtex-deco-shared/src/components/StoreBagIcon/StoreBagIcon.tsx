import { Image } from 'eitri-luminus'
import storeBagIcon from '../../assets/icons/storebag.png'

interface StoreBagIconProps {
	className?: string
	size?: number | string
}

export default function StoreBagIcon(props: StoreBagIconProps) {
	const { className, size } = props
	return (
		<Image
			src={storeBagIcon}
			width={size || 24}
			height={size || 24}
			className={className || 'object-contain'}
		/>
	)
}
