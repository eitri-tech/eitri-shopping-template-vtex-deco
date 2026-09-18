import { View, Text } from 'eitri-luminus'
import { useTranslation } from 'eitri-i18n'
import ProductCard from '../ProductCard/ProductCard'
import CloseCircleIcon from '../CloseCircleIcon/CloseCircleIcon'
import Loading from '../Loading/LoadingComponent'
import { getAgrupadorCode } from '../../utils/metalSwatches'
import type { Product } from '../../types/product'

export interface Props {
	searchResults: Product[]
	isLoading?: boolean
	siblingsByCode?: Record<string, Product[]>
}

export default function SearchResults({ searchResults, isLoading, siblingsByCode }: Props) {
	const { t } = useTranslation()

	if (searchResults.length === 0 && !isLoading) {
		return (
			<View className='flex flex-col items-center justify-center mt-32 gap-4'>
				<CloseCircleIcon
					className='text-primary'
					size={42}
				/>
				<Text className='text-xl font-bold text-gray-800 text-center'>{t('searchResultsEmpty.title')}</Text>
				<Text className='text-lg text-gray-600 font-bold text-center max-w-xs'>
					{t('searchResultsEmpty.hint')}
				</Text>
			</View>
		)
	}

	return (
		<View className='flex flex-col p-4 gap-4'>
			<View className='grid grid-cols-2 gap-4'>
				{searchResults.map(product => (
					<View
						key={product.productId}
						className='w-full'>
						<ProductCard
							product={product}
							siblings={siblingsByCode?.[getAgrupadorCode(product)]}
						/>
					</View>
				))}
			</View>

			{isLoading && (
				<View className='flex items-center justify-center'>
					<Loading />
				</View>
			)}
		</View>
	)
}
