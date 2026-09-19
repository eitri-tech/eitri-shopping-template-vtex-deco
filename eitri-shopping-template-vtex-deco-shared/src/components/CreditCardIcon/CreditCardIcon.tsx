import { FiCreditCard } from 'react-icons/fi'

interface CreditCardIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function CreditCardIcon(props: CreditCardIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiCreditCard
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
