import { GenericBox } from 'eitri-shopping-template-vtex-deco-shared'
import { FiChevronRight } from 'react-icons/fi'

export default function ProfileCardButton(props) {
	const { icon, label, onClick } = props

	return (
		<GenericBox
			className='flex justify-between items-center p-4 w-full'
			onClick={onClick}>
			<View className='flex flex-row items-center gap-2'>
				{icon}
				<Text className='text-gray-700 font-medium'>{label}</Text>
			</View>
			<FiChevronRight
				size={16}
				className='text-gray-700'
			/>
		</GenericBox>
	)
}
