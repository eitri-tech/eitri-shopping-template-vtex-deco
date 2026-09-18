import { FiInfo } from 'react-icons/fi'

export default function InfoCircleIcon(props) {
	return (
		<FiInfo
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
