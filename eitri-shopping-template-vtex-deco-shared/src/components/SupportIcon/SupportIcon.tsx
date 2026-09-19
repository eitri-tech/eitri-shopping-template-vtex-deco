import { FiHeadphones } from 'react-icons/fi'

interface SupportIconProps {
	className?: string
	size?: number | string
}

export default function SupportIcon(props: SupportIconProps) {
	const { className, size } = props

	return (
		<FiHeadphones
			className={className}
			size={size || 24}
		/>
	)
}
