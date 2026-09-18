import { Text, View } from 'eitri-luminus'
import { BottomInset, PackageIcon } from 'eitri-shopping-template-vtex-deco-shared'

interface NoItemProps {
	title?: string
	subtitle?: string
}

export default function NoItem(props: NoItemProps) {
	const { title, subtitle } = props

	return (
		<View className='flex flex-1 flex-col justify-center items-center'>
			<View className='flex flex-col items-center gap-4 w-full max-w-xs mt-4'>
				<PackageIcon
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
