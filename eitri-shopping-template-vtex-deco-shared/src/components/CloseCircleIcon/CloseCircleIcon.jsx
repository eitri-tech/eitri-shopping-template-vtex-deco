import { FiXCircle } from 'react-icons/fi'

export default function CloseCircleIcon(props) {
	return (
		<FiXCircle
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
