import { FiChevronLeft } from 'react-icons/fi'

export default function ChevronLeftIcon(props) {
	return (
		<FiChevronLeft
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
