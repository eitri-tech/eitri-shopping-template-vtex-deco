import { FiMessageCircle } from 'react-icons/fi'

export default function MessageCircleIcon(props) {
	return (
		<FiMessageCircle
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
