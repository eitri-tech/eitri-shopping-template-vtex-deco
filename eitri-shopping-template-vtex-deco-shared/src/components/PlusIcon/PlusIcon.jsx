import { FiPlus } from 'react-icons/fi'

export default function PlusIcon(props) {
	return (
		<FiPlus
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
