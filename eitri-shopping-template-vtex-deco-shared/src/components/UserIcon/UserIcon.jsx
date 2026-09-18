import { FiUser } from 'react-icons/fi'

export default function UserIcon(props) {
	return (
		<FiUser
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
