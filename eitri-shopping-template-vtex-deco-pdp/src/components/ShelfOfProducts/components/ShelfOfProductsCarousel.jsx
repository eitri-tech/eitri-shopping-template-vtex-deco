import ProductCard from '../../ProductCard/ProductCard'
import ProductCardLoading from './ProductCardLoading'
export default function ShelfOfProductsCarousel(props) {
	const { isLoading, products, gap, locale, currency } = props
	const products_per_page = 2

	const productsPage = []
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
						{products.map((product, index) => (
							<View
								key={index}
								className='flex w-[180px] m-2'>
								<ProductCard
									product={product}
									locale={locale}
									currency={currency}
								/>
							</View>
						))}
					</View>
				</View>
			)}
		</>
	)
}
