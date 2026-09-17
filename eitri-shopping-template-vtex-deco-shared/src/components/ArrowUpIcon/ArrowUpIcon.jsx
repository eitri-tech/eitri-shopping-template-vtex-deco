import { FiArrowUp } from 'react-icons/fi'

export default function ArrowUpIcon(props) {
	return (
		<FiArrowUp
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
