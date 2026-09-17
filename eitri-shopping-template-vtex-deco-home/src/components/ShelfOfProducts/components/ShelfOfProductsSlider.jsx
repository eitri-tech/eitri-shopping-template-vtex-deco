import ProductCard from '../../ProductCard/ProductCard'
import { View } from 'eitri-luminus'

export default function ShelfOfProductsSlider(props) {
	const { isLoading, products } = props

	return (
		<>
			{isLoading ? (
				<View className='flex overflow-x-auto'>
					<View className='flex gap-4 px-4 py-2'>
						<View className='mt-2 min-w-[50vw] h-[388px] bg-gray-200 rounded animate-pulse' />
						<View className='mt-2 min-w-[50vw] h-[388px] bg-gray-200 rounded animate-pulse' />
						<View className='mt-2 min-w-[50vw] h-[388px] bg-gray-200 rounded animate-pulse' />
					</View>
				</View>
			) : (
				<View className='flex overflow-x-auto'>
					<View className='flex gap-4 px-4 py-2'>
						{products?.map(product => (
							<ProductCard
								key={product.productId}
								product={product}
								className={`w-[50vw]`}
							/>
						))}
					</View>
				</View>
			)}
		</>
	)
}
