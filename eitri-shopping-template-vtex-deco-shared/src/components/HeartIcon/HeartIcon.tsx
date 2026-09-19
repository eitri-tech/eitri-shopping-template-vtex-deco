import { FiHeart } from 'react-icons/fi'

interface HeartIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function HeartIcon(props: HeartIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiHeart
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
