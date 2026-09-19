import { FiRotateCcw } from 'react-icons/fi'

interface CircularArrowIconProps {
	className?: string
	size?: number | string
}

export default function CircularArrowIcon(props: CircularArrowIconProps) {
	const { className, size } = props

	return (
		<FiRotateCcw
			className={className}
			size={size || 24}
		/>
	)
}
