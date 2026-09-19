import { FiBell } from 'react-icons/fi'

interface BellIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function BellIcon(props: BellIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiBell
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
