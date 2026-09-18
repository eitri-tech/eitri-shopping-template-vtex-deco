import ProductList from '../components/ProductList/ProductList'
import type { Facet } from './types'
import type { ImageWidget } from '../types/widgets'

export interface Props {
	/** @title Título. */
	title?: string
	/** @title Filtros (facets). */
	facets?: Facet[]
	/** @title Termo de busca. */
	term?: string
	/** @title Ordenação padrão. */
	sort?: string
	/** @title Imagem de banner. */
	banner?: ImageWidget
	/** @title Exibir filtros. */
	showFilters?: boolean
	/**
	 * @title Opções de ordenação ocultas.
	 * @description Valores de ordenação a esconder (ex: "OrderByReleaseDateDESC").
	 */
	hiddenSortOptions?: string[]
}

export default function ProductListSection(props: Props) {
	const { title, facets, term, sort, banner, showFilters, hiddenSortOptions } = props

	return (
		<ProductList
			facets={facets}
			sort={sort}
			query={term}
			title={title}
			banner={banner}
			showFilters={showFilters}
			hiddenSortOptions={hiddenSortOptions}
		/>
	)
}
