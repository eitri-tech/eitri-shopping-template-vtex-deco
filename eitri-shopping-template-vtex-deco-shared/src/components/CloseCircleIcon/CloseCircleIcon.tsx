import { FiXCircle } from 'react-icons/fi'

interface CloseCircleIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function CloseCircleIcon(props: CloseCircleIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiXCircle
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
