import { Text, View } from 'eitri-luminus'
export default function ListWithImages(props) {
	const { currentShelf, chooseCategory } = props
	return (
		<View className='px-8 flex flex-col'>
			{currentShelf?.content?.map(category => (
				<View
					key={category.title}
					onClick={() => chooseCategory(category)}
					height='71px'
					backgroundColor={category.color}>
					<View
						width='100%'
						className='px-8 justify-between items-center flex'>
						<Text
							fontFamily='Baloo 2'
							className='text-base text-base-100 font-bold'>
							{category?.title}
						</Text>
						{category.thumbnail && (
							<View
								width='71px'
								height='71px'
								className='flex items-center justify-center p-2'>
								<Image
									src={category.thumbnail}
									maxHeight='100%'
									maxWidth='100%'
								/>
							</View>
						)}
					</View>
				</View>
			))}
		</View>
	)
}
