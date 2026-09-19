import { LuTicket } from 'react-icons/lu'

interface TicketIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function TicketIcon(props: TicketIconProps) {
	const { className, size, ...rest } = props
	return (
		<LuTicket
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
