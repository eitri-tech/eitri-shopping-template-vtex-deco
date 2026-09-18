import { FiHeadphones } from 'react-icons/fi'

export default function SupportIcon(props) {
	const { className, size } = props

	return (
		<FiHeadphones
			className={className}
			size={size || 24}
		/>
	)
}
