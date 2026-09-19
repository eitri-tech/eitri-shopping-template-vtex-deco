import { FiChevronLeft } from 'react-icons/fi'

interface ChevronLeftIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function ChevronLeftIcon(props: ChevronLeftIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiChevronLeft
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
