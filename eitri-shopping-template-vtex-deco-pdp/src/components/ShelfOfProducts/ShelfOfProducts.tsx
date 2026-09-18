import { Loading } from 'eitri-shopping-template-vtex-deco-shared'
import { Text, View, Skeleton } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import { useTranslation } from 'eitri-i18n'
import ProductCard from '../ProductCard/ProductCard'
import ShelfOfProductsCarousel from './components/ShelfOfProductsCarousel'
import type { VtexProduct } from '../../types/vtex'

interface ShelfOfProductsProps {
	products?: VtexProduct[]
	title?: string
	gap?: string | number
	paddingHorizontal?: string | number
	isLoading?: boolean
	mode?: 'carousel' | string
	searchParams?: Record<string, unknown>
	[key: string]: unknown
}

export default function ShelfOfProducts(props: ShelfOfProductsProps) {
	const { products, title, gap, paddingHorizontal, isLoading, mode, searchParams } = props
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
						products.map((product, index) => (
							<View
								key={product?.productId ?? index}
								className={`scroll-snap-start ml-[${gap}px]`}>
								<ProductCard product={product} />
							</View>
						))}
					{gap && <View className={`h-[1px] w-[${gap}px]`} />}
				</View>
			)}
		</View>
	)
}
