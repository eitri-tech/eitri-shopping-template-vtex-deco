import { FiHeart } from 'react-icons/fi'

export default function HeartIcon(props) {
	return (
		<FiHeart
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
