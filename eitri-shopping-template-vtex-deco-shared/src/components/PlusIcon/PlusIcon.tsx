import { FiPlus } from 'react-icons/fi'

interface PlusIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function PlusIcon(props: PlusIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiPlus
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
