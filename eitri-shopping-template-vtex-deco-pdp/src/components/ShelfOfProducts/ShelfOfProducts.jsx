import { Loading } from 'eitri-shopping-template-vtex-deco-shared'
import { Text, View, Skeleton } from 'eitri-luminus'
import ProductCard from '../ProductCard/ProductCard'
import ShelfOfProductsCarousel from './components/ShelfOfProductsCarousel'
import Eitri from 'eitri-bifrost'
import { useTranslation } from 'eitri-i18n'
export default function ShelfOfProducts(props) {
	const { products, title, gap, paddingHorizontal, isLoading, mode, searchParams, ...rest } = props
	const { t } = useTranslation()
	const seeMore = () => {
		Eitri.navigation.navigate({
			path: 'ProductCatalog',
			state: {
				params: searchParams,
				title: title
			}
		})
	}
	return (
		<View>
			{title && (
				<View className={`pl-4 flex justify-between items-center px-${paddingHorizontal || '36'}`}>
					<Text className='text-lg font-bold'>{isLoading ? t('shelfOfProducts.loading') : title}</Text>
					{searchParams && (
						<View
							onClick={seeMore}
							className='flex items-center min-w-fit'>
							<Text className='font-bold text-primary-content underline'>{t('shelfOfProducts.seeMore')}</Text>
							<View>
								{/* <Icon iconKey="chevron-right" color="primary-900" width={18} height={18} /> */}
							</View>
						</View>
					)}
				</View>
			)}
			{mode === 'carousel' && (
				<ShelfOfProductsCarousel
					paddingHorizontal={paddingHorizontal}
					isLoading={isLoading}
					products={products}
					gap={gap}
				/>
			)}
			{mode !== 'carousel' && (
				<View className={`flex flex-row overflow-x-scroll scroll-snap-x-mandatory gap-${gap}`}>
					{gap && <View className={`h-[1px] w-[${gap}px]`} />}
					{isLoading && (
						<View className={`flex flex-row gap-2 px-4 justify-center`}>
							<Skeleton className='w-[188px] min-h-[288px] bg-neutral'></Skeleton>
							<Skeleton className='w-[188px] min-h-[288px] bg-neutral'></Skeleton>
						</View>
					)}
					{!isLoading &&
						products &&
						products.map(product => (
							<View className={`scroll-snap-start ml-[${gap}px]`}>
								<ProductCard
									product={product}
									key={product?.productId}
									width='188px'
								/>
							</View>
						))}
					{gap && <View className={`h-[1px] w-[${gap}px]`} />}
				</View>
			)}
		</View>
	)
}
