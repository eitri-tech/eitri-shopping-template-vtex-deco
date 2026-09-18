import { LuPercent } from 'react-icons/lu'

interface PercentIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function PercentIcon(props: PercentIconProps) {
	const { className, size, ...rest } = props
	return (
		<LuPercent
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
