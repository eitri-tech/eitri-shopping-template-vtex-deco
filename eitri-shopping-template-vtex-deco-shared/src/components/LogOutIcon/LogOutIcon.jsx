import { FiLogOut } from 'react-icons/fi'

export default function LogOutIcon(props) {
	return (
		<FiLogOut
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
