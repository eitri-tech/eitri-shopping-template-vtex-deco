import { FiX } from 'react-icons/fi'

export default function CloseIcon(props) {
	return (
		<FiX
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
