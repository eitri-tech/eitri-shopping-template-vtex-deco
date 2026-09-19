import { FiMapPin } from 'react-icons/fi'

interface MapPinIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function MapPinIcon(props: MapPinIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiMapPin
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
