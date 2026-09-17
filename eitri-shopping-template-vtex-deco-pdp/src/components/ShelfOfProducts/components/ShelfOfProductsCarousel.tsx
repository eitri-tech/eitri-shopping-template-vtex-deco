import { View } from 'eitri-luminus'
import ProductCard from '../../ProductCard/ProductCard'
import ProductCardLoading from './ProductCardLoading'
import type { VtexProduct } from '../../../types/vtex'

interface ShelfOfProductsCarouselProps {
	isLoading?: boolean
	products?: VtexProduct[]
	gap?: string | number
	locale?: string
	currency?: string
}

export default function ShelfOfProductsCarousel(props: ShelfOfProductsCarouselProps) {
	const { isLoading, products, gap } = props
	const products_per_page = 2

	const productsPage: VtexProduct[][] = []
	if (Array.isArray(products)) {
		for (let i = 0; i < products.length; i += products_per_page) {
			productsPage.push(products.slice(i, i + products_per_page))
		}
	}

	return (
		<>
			{isLoading ? (
				<ProductCardLoading gap={gap} />
			) : (
				<View className='w-full overflow-x-auto flex space-x-4 px-2'>
					<View className='flex gap-2'>
						{(products ?? []).map((product, index) => (
							<View
								key={index}
								className='flex w-[180px] m-2'>
								<ProductCard product={product} />
							</View>
						))}
					</View>
				</View>
			)}
		</>
	)
}
