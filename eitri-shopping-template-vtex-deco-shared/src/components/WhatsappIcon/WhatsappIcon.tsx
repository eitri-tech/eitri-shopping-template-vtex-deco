import { FaWhatsapp } from 'react-icons/fa'

interface WhatsappIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function WhatsappIcon(props: WhatsappIconProps) {
	const { className, size, ...rest } = props
	return (
		<FaWhatsapp
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
