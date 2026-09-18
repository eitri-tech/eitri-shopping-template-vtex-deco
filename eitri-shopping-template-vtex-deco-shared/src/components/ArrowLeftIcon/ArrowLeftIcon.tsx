import { FiArrowLeft } from 'react-icons/fi'

interface ArrowLeftIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function ArrowLeftIcon(props: ArrowLeftIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiArrowLeft
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
