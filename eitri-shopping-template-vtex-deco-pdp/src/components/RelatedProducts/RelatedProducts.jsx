import { useTranslation } from 'eitri-i18n'
import { getWhoSawAlsoSaw } from '../../services/productService'
import ProductCard from '../ProductCard/ProductCard'

export default function RelatedProducts(props) {
	const { product } = props
	const { t } = useTranslation()
	const [relatedProducts, setRelatedProducts] = useState(null)
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		if (!product) return
		loadRelatedProducts(product?.productId)
	}, [product])

	const loadRelatedProducts = async productId => {
		try {
			setIsLoading(true)
			let relatedProducts = await getWhoSawAlsoSaw(productId)
			const availableRelatedProducts = relatedProducts.filter(rp => {
				return rp.items.some(i => i.sellers.some(s => s.commertialOffer.AvailableQuantity > 0))
			})
			setRelatedProducts(availableRelatedProducts)
			return relatedProducts
		} catch (e) {
			console.log('loadRelatedProducts: Error', e)
		} finally {
			setIsLoading(false)
		}
	}

	if ((!relatedProducts || relatedProducts?.length === 0) && !isLoading) return null

	return (
		<View className='mt-4'>
			<View className='px-4'>
				<Text className='text-lg font-semibold'>{t('productBasicTemplate.txtWhoSaw')}</Text>
			</View>

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
						{relatedProducts.map(product => (
							<ProductCard
								key={product.productId}
								product={product}
								className={`w-[50vw]`}
							/>
						))}
					</View>
				</View>
			)}
		</View>

		// <ShelfOfProductsCarousel
		// 	paddingHorizontal={paddingHorizontal}
		// 	isLoading={isLoading}
		// 	products={products}
		// 	gap={gap}
		// />

		// <ShelfOfProducts
		// 	title={t('productBasicTemplate.txtWhoSaw')}
		// 	mode='carousel'
		// 	products={relatedProducts}
		// />
	)
}
