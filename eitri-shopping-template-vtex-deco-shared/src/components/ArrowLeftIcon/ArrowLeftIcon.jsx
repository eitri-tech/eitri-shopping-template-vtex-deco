import { FiArrowLeft } from 'react-icons/fi'

export default function ArrowLeftIcon(props) {
	return (
		<FiArrowLeft
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
