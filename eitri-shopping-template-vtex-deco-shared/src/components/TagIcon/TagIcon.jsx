import { LuTag } from 'react-icons/lu'

export default function TagIcon(props) {
	return (
		<LuTag
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
