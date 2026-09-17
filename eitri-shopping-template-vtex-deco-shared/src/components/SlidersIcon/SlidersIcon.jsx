import { FiSliders } from 'react-icons/fi'

export default function SlidersIcon(props) {
	return (
		<FiSliders
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
