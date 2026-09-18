import { FiCreditCard } from 'react-icons/fi'

export default function CreditCardIcon(props) {
	return (
		<FiCreditCard
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
