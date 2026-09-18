import { FiCheck } from 'react-icons/fi'

export default function CheckIcon(props) {
	return (
		<FiCheck
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
