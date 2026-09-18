import { FiHelpCircle } from 'react-icons/fi'

export default function HelpCircleIcon(props) {
	return (
		<FiHelpCircle
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
