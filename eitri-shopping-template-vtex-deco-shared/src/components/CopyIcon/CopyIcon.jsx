import { FiCopy } from 'react-icons/fi'

export default function CopyIcon(props) {
	return (
		<FiCopy
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
