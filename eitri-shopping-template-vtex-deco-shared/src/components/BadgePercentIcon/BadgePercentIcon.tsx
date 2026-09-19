import { LuBadgePercent } from 'react-icons/lu'

interface BadgePercentIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function BadgePercentIcon(props: BadgePercentIconProps) {
	const { className, size, ...rest } = props
	return (
		<LuBadgePercent
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
