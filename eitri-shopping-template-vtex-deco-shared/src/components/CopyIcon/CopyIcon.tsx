import { FiCopy } from 'react-icons/fi'

interface CopyIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function CopyIcon(props: CopyIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiCopy
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
