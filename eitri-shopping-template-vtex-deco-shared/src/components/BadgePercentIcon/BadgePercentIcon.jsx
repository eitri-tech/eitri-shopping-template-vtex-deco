import { LuBadgePercent } from 'react-icons/lu'

export default function BadgePercentIcon(props) {
	return (
		<LuBadgePercent
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
