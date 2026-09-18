import { View, Image } from 'eitri-luminus'
import { openProduct } from '../../../services/NavigationService'

interface Props {
	products?: any[]
	isLoading?: boolean
}

export default function ProductImageShelf({ products, isLoading }: Props) {
	return (
		<View className='flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
			<View className='flex gap-[2px]'>
				{isLoading
					? [0, 1, 2].map(i => (
							<View key={i} className='min-w-[33vw] aspect-square bg-gray-200 animate-pulse' />
					  ))
					: products?.map(product => {
							const imageUrl = product.items?.[0]?.images?.[0]?.imageUrl
							return imageUrl ? (
								<View
									key={product.productId}
									className='min-w-[33vw] aspect-square'
									onClick={() => openProduct(product)}>
									<Image
										src={imageUrl}
										className='w-full h-full'
									/>
								</View>
							) : null
					  })}
			</View>
		</View>
	)
}
