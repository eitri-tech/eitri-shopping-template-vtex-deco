import { View } from 'eitri-luminus'
import { FiSearch } from 'react-icons/fi'

interface HeaderSearchIconProps {
	onClick?: () => void
}

export default function HeaderSearchIcon(props: HeaderSearchIconProps) {
	const { onClick } = props

	return (
		<View onClick={onClick}>
			<FiSearch
				className='text-header-content'
				size={24}
			/>
		</View>
	)
}
