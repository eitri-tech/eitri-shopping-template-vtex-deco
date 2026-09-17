import ProductCatalogContent from '../../ProductCatalogContent/ProductCatalogContent'

export default function ProductInfiniteScroll(props) {
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
				showFilters={data.showFilters}
			/>
		</View>
	)
}
