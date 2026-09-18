import { GoAlert } from 'react-icons/go'
import { View } from 'eitri-luminus'

export default function AlertIcon(props) {
	const { className, size = 26 } = props

	return (
		<GoAlert
			className={className || 'text-primary'}
			size={`${size}px`}
		/>
	)
}
