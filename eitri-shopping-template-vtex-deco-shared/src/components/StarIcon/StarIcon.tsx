import { FiStar } from 'react-icons/fi'

interface StarIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function StarIcon(props: StarIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiStar
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
