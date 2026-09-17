import { View } from 'eitri-luminus'
import { FiSearch } from 'react-icons/fi'

export default function HeaderSearchIcon(props) {
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
