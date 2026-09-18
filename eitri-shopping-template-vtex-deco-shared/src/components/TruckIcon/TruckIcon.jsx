import { FiTruck } from 'react-icons/fi'

export default function TruckIcon(props) {
	return (
		<FiTruck
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
