import { FiCheck } from 'react-icons/fi'

interface CheckIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function CheckIcon(props: CheckIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiCheck
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
