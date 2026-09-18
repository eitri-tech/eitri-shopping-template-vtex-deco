import { FiLogOut } from 'react-icons/fi'

interface LogOutIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function LogOutIcon(props: LogOutIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiLogOut
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
