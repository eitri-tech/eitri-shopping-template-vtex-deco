import { ArrowRightIcon } from 'eitri-shopping-template-vtex-deco-shared'

export default function ProfileCardButton(props) {
	const { icon, label, onClick } = props

	return (
		<View
			className='flex justify-between items-center px-4 py-4 w-full'
			onClick={onClick}>
			<View className='flex flex-row items-center gap-2'>
				{icon}
				<Text className='text-gray-700 font-medium'>{label}</Text>
			</View>
			<ArrowRightIcon
				size={16}
				className='text-gray-700'
			/>
		</View>
	)
}
