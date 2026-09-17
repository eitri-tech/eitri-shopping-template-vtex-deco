import { FiBell } from 'react-icons/fi'

export default function BellIcon(props) {
	return (
		<FiBell
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
