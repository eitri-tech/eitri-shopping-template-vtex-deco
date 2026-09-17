import { View, Text } from 'eitri-luminus'
import ProductCatalogContent from '../components/ProductCatalogContent/ProductCatalogContent'
import type { Facet } from './types'

export interface Props {
	/**
	 * @title Título.
	 */
	title?: string
	facets?: Facet[]
	/**
	 * @title Termo de busca.
	 */
	term?: string
	sort?: string
	/**
	 * @title Exibir filtros.
	 */
	showFilters?: boolean
	/**
	 * @title Opções de ordenação ocultas.
	 * @description Valores de ordenação a esconder (ex: "OrderByReleaseDateDESC").
	 */
	hiddenSortOptions?: string[]
}

export default function ProductInfiniteScroll(props: Props) {
	const { title, showFilters, hiddenSortOptions } = props

	return (
		<View>
			{title && (
				<View className='flex justify-between items-center px-4'>
					<Text className='font-bold text-xl'>{title}</Text>
				</View>
			)}
			<ProductCatalogContent
				params={props}
				showFilters={showFilters}
				hiddenSortOptions={hiddenSortOptions}
			/>
		</View>
	)
}
