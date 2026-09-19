import { Loading, View, Text } from 'eitri-luminus'

interface LoadingComponentProps {
	isLoading?: boolean
	fullScreen?: boolean
	text?: string
}

export default function LoadingComponent(props: LoadingComponentProps) {
	const { isLoading, fullScreen, text } = props

	if (typeof isLoading === 'boolean' && !isLoading) return null

	if (fullScreen) {
		return (
			<View className='fixed inset-0 z-[9999] bg-white opacity-90 flex flex-col justify-center items-center'>
				<Loading className='loading-lg' />
				{text && (
					<View className='mt-2 max-w-[200px] text-center'>
						<Text>{text}</Text>
					</View>
				)}
			</View>
		)
	}

	return (
		<View>
			<Loading />
		</View>
	)
}
