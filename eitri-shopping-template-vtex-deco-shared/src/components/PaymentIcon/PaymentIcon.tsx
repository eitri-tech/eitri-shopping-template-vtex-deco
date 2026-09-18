import { FiCreditCard } from 'react-icons/fi'

interface PaymentIconProps {
	className?: string
	size?: number | string
}

export default function PaymentIcon(props: PaymentIconProps) {
	const { className, size } = props

	return (
		<FiCreditCard
			className={className}
			size={size || 24}
		/>
	)
}
