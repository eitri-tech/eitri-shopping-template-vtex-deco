import { FiMail } from 'react-icons/fi'

interface MailIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function MailIcon(props: MailIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiMail
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
