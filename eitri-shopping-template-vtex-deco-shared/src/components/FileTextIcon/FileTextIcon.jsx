import { FiFileText } from 'react-icons/fi'

export default function FileTextIcon(props) {
	return (
		<FiFileText
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
