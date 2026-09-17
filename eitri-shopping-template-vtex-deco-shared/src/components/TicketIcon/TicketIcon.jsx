import { LuTicket } from 'react-icons/lu'

export default function TicketIcon(props) {
	return (
		<LuTicket
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
