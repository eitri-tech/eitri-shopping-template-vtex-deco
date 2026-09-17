import { BottomInset } from 'eitri-shopping-template-vtex-deco-shared'

export default function FixedBottom(props) {
	const { children, offSetHeight, className } = props

	return (
		<View>
			<View className='fixed bottom-0 left-0 w-full z-10 bg-white shadow-sm border-gray-300 border-t'>
				<View className={`p-4 ${className}`}>{children}</View>
				<BottomInset />
			</View>

			<View
				style={{ height: offSetHeight || 'auto' }}
				className='w-full'
			/>

			<BottomInset />
		</View>
	)
}
