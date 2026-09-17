import { BottomInset } from 'eitri-shopping-template-vtex-deco-shared'
import { FiPackage } from 'react-icons/fi'

export default function NoItem(props) {
	const { title, subtitle } = props

	return (
		<View className='flex flex-1 flex-col justify-center items-center'>
			<View className='flex flex-col items-center gap-4 w-full max-w-xs mt-4'>
				<FiPackage
					size={50}
					className={'text-primary'}
				/>
				<Text className='font-bold text-gray-800 text-xl text-center'>{title}</Text>
				<Text className='text-gray-600 text-center'>{subtitle}</Text>
			</View>
			<BottomInset />
		</View>
	)
}
