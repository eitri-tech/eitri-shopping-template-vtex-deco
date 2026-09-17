import { View, Image } from 'eitri-luminus'
import { openProduct } from '../../../services/NavigationService'

export function ProductImageShelf(props) {
	const { products, isLoading } = props

	return (
		<View className='flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
			<View className='flex gap-[11px]'>
				{isLoading
					? [0, 1, 2].map(i => (
							<View key={i} className='min-w-[33vw] aspect-[154/247] bg-gray-200 animate-pulse' />
					  ))
					: products?.map(product => {
							const imageUrl = product.items?.[0]?.images?.[0]?.imageUrl
							return imageUrl ? (
								<View
									key={product.productId}
									className='min-w-[33vw] aspect-[154/247]'
									onClick={() => openProduct(product)}>
									<Image
										src={imageUrl}
										className='w-full h-full object-cover'
									/>
								</View>
							) : null
					  })}
			</View>
		</View>
	)
}
