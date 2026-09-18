import { FiRotateCcw } from 'react-icons/fi'

export default function CircularArrowIcon(props) {
	const { className, size } = props

	return (
		<FiRotateCcw
			className={className}
			size={size || 24}
		/>
	)
}
