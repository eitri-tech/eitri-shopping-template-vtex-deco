import { View, Loading } from 'eitri-luminus'

export default function LoadingComponent(props) {
	const { isLoading, fullScreen } = props

	if (typeof isLoading === 'boolean' && !isLoading) return null

	if (fullScreen) {
		return (
			<View className='fixed inset-0 z-[999] bg-neutral-500/30 flex justify-center items-center'>
				<Loading className='loading-lg text-primary' />
			</View>
		)
	}

	return (
		<View>
			<Loading className='text-primary' />
		</View>
	)
}
