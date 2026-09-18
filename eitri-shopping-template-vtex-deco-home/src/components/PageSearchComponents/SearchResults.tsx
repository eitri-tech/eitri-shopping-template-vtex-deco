import { Loading } from 'eitri-shopping-template-vtex-deco-shared'
import { FiXCircle } from 'react-icons/fi'
import { View, Text } from 'eitri-luminus'
import ProductCard from '../ProductCard/ProductCard'
import { useTranslation } from 'eitri-i18n'
import type { VtexProduct } from '../../types/vtex'

interface SearchResultsProps {
	searchResults: VtexProduct[]
	isLoading?: boolean
}

export default function SearchResults(props: SearchResultsProps) {
	const { searchResults, isLoading } = props

	const { t } = useTranslation()

	if (searchResults.length === 0 && !isLoading) {
		return (
			<View className='flex flex-col items-center justify-center mt-32 gap-4'>
				<FiXCircle
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
				{searchResults.map((product, index) => (
					<View
						key={product.productId}
						className='w-full'>
						<ProductCard product={product} />
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
