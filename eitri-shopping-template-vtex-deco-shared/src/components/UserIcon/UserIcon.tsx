import { FiUser } from 'react-icons/fi'

interface UserIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function UserIcon(props: UserIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiUser
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
