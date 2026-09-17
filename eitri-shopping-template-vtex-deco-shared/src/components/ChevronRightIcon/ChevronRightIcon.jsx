import { FiChevronRight } from 'react-icons/fi'

export default function ChevronRightIcon(props) {
	return (
		<FiChevronRight
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
