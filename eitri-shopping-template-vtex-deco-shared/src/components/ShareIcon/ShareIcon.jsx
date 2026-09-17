import { FiShare2 } from 'react-icons/fi'

export default function ShareIcon(props) {
	return (
		<FiShare2
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
