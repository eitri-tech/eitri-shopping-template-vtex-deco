import { FiClock } from 'react-icons/fi'

interface ClockIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function ClockIcon(props: ClockIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiClock
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
