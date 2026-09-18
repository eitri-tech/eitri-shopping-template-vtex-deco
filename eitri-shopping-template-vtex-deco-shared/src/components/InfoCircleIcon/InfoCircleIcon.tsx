import { FiInfo } from 'react-icons/fi'

interface InfoCircleIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function InfoCircleIcon(props: InfoCircleIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiInfo
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
