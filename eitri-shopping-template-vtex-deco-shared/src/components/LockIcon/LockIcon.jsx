import { FiLock } from 'react-icons/fi'

export default function LockIcon(props) {
	return (
		<FiLock
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
