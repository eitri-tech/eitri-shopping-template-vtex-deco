import { FiTrash2 } from 'react-icons/fi'

export default function TrashIcon(props) {
	return (
		<FiTrash2
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
