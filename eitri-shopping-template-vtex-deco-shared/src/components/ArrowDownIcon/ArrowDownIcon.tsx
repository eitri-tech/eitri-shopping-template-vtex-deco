import { FiArrowDown } from 'react-icons/fi'

interface ArrowDownIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function ArrowDownIcon(props: ArrowDownIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiArrowDown
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
