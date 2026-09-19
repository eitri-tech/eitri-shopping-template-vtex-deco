import { FiTruck } from 'react-icons/fi'

interface TruckIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function TruckIcon(props: TruckIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiTruck
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
