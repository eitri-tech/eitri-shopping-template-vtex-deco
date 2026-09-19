import { FiLock } from 'react-icons/fi'

interface LockIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function LockIcon(props: LockIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiLock
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
