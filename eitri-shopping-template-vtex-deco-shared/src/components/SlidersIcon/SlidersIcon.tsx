import { FiSliders } from 'react-icons/fi'

interface SlidersIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function SlidersIcon(props: SlidersIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiSliders
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
