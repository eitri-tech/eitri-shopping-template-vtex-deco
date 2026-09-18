import { FiClock } from 'react-icons/fi'

export default function ClockIcon(props) {
	return (
		<FiClock
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
