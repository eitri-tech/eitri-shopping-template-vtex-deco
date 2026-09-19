import { FiMessageCircle } from 'react-icons/fi'

interface MessageCircleIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function MessageCircleIcon(props: MessageCircleIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiMessageCircle
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
