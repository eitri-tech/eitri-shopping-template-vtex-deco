import { FiArrowDown } from 'react-icons/fi'

export default function ArrowDownIcon(props) {
	return (
		<FiArrowDown
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
