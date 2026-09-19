import { GoAlert } from 'react-icons/go'

interface AlertIconProps {
	className?: string
	size?: number | string
}

export default function AlertIcon(props: AlertIconProps) {
	const { className, size = 26 } = props

	return (
		<GoAlert
			className={className || 'text-primary'}
			size={`${size}px`}
		/>
	)
}
