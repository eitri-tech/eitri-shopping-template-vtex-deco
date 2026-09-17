import { Skeleton, View } from 'eitri-luminus'

export default function HomeSkeleton(props) {
	const { show } = props
	return (
		<View className={`p-4 ${show ? 'block' : 'hidden'}`}>
			<View className='flex flex-col gap-4'>
				<Skeleton className='w-full min-h-[200px] rounded' />
				<View className='flex flex-row gap-4'>
					<Skeleton className='w-full min-h-[200px] rounded' />
					<Skeleton className='w-full min-h-[200px] rounded' />
					<Skeleton className='w-full min-h-[200px] rounded' />
				</View>
				<Skeleton className='w-full h-screen rounded' />
			</View>
		</View>
	)
}
