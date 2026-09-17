import { FiStar } from 'react-icons/fi'

export default function StarIcon(props) {
	return (
		<FiStar
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
