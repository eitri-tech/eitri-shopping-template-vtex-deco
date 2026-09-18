import { LuCircleDollarSign } from 'react-icons/lu'

export default function CircleDollarSignIcon(props) {
	return (
		<LuCircleDollarSign
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
