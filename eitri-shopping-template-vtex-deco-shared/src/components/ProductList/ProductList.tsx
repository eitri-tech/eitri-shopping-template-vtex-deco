import ProductCatalogContent from '../ProductCatalogContent/ProductCatalogContent'
import type { Facet } from '../../sections/types'

export interface ProductListProps {
	facets?: Facet[]
	sort?: string
	query?: string
	title?: string
	banner?: string
	showFilters?: boolean
	hiddenSortOptions?: string[]
}

export default function ProductList(props: ProductListProps) {
	const { facets, sort, query, title, banner, showFilters = true, hiddenSortOptions } = props

	const params = { facets, sort, query }

	return (
		<ProductCatalogContent
			banner={banner}
			params={params}
			title={title}
			showFilters={showFilters}
			hiddenSortOptions={hiddenSortOptions}
		/>
	)
}
