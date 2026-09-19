import { FiChevronRight } from 'react-icons/fi'

interface ChevronRightIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function ChevronRightIcon(props: ChevronRightIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiChevronRight
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
