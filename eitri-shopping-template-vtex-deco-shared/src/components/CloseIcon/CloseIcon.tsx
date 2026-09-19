import { FiX } from 'react-icons/fi'

interface CloseIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function CloseIcon(props: CloseIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiX
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
