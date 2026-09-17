export default function ReviewMiniProducts(props) {
	const { products } = props

	return (
		<View className='flex flex-col gap-2'>
			{products?.map(item => (
				<View
					key={item.imageUrl}
					className='flex flex-row w-full gap-4'>
					<Image
						src={item.imageUrl}
						className='w-[40px] object-cover'
					/>
					<Text className='text-sm'>{item.name}</Text>
				</View>
			))}
		</View>
	)
}
