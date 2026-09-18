import { FiSearch } from 'react-icons/fi'

interface SearchIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function SearchIcon(props: SearchIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiSearch
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
