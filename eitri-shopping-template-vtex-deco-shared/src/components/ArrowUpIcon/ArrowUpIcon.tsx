import { FiArrowUp } from 'react-icons/fi'

interface ArrowUpIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function ArrowUpIcon(props: ArrowUpIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiArrowUp
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
