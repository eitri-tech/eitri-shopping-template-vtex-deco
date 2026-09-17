import { FiSearch } from 'react-icons/fi'

export default function SearchIcon(props) {
	return (
		<FiSearch
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
