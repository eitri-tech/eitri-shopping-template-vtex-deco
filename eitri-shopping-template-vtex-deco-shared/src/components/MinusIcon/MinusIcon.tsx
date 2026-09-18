import { FiMinus } from 'react-icons/fi'

interface MinusIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function MinusIcon(props: MinusIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiMinus
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
