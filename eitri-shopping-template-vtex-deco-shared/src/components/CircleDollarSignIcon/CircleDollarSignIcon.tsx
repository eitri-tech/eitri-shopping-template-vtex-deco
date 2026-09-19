import { LuCircleDollarSign } from 'react-icons/lu'

interface CircleDollarSignIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function CircleDollarSignIcon(props: CircleDollarSignIconProps) {
	const { className, size, ...rest } = props
	return (
		<LuCircleDollarSign
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
