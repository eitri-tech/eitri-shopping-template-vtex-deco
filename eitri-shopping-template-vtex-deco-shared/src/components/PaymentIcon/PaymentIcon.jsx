import { FiCreditCard } from 'react-icons/fi'

export default function PaymentIcon(props) {
	const { className, size } = props

	return (
		<FiCreditCard
			className={className}
			size={size || 24}
		/>
	)
}
