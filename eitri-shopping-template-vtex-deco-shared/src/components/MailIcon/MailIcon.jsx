import { FiMail } from 'react-icons/fi'

export default function MailIcon(props) {
	return (
		<FiMail
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
