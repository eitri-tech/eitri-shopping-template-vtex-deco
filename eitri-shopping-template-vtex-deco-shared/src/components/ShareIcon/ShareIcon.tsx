import { FiShare2 } from 'react-icons/fi'

interface ShareIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function ShareIcon(props: ShareIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiShare2
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
