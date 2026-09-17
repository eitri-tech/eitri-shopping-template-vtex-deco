import { FiMapPin } from 'react-icons/fi'

export default function MapPinIcon(props) {
	return (
		<FiMapPin
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
