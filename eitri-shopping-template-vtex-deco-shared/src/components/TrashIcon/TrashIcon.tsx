import { FiTrash2 } from 'react-icons/fi'

interface TrashIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function TrashIcon(props: TrashIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiTrash2
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
