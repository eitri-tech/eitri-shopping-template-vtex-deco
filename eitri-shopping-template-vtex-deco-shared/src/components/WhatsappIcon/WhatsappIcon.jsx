import { FaWhatsapp } from 'react-icons/fa'

export default function WhatsappIcon(props) {
	return (
		<FaWhatsapp
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
