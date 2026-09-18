import { FiMinus } from 'react-icons/fi'

export default function MinusIcon(props) {
	return (
		<FiMinus
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
