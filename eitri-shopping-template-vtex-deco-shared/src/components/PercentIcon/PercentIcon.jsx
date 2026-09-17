import { LuPercent } from 'react-icons/lu'

export default function PercentIcon(props) {
	return (
		<LuPercent
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
