import { View, Text } from 'eitri-luminus'
import ProductCatalogContent from '../../ProductCatalogContent/ProductCatalogContent'

interface ProductInfiniteScrollData {
	title?: string
	facets?: Array<{ key: string; value: string }>
	query?: string
	sort?: string
	showFilters?: boolean
	[key: string]: unknown
}

interface ProductInfiniteScrollProps {
	data?: ProductInfiniteScrollData
}

export default function ProductInfiniteScroll(props: ProductInfiniteScrollProps) {
	const { data } = props

	return (
		<View>
			{data?.title && (
				<View className='flex justify-between items-center px-4'>
					<Text className='font-bold text-xl'>{data?.title}</Text>
				</View>
			)}
			<ProductCatalogContent
				params={data}
				showFilters={data?.showFilters}
			/>
		</View>
	)
}
