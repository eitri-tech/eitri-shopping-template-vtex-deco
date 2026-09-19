import { useState, useEffect } from 'react'
import { getProductsService } from '../../../services/ProductService'
import ShelfOfProducts from '../../ShelfOfProducts/ShelfOfProducts'
import type { VtexProduct } from '../../../types/vtex'

interface ProductShelfData {
	facets?: Array<{ key: string; value: string }>
	term?: string
	sort?: string
	numberOfItems?: number
	mode?: string
	title?: string
	[key: string]: unknown
}

interface ProductShelfProps {
	data: ProductShelfData
}

export default function ProductShelf(props: ProductShelfProps) {
	const { data } = props

	const [currentProducts, setCurrentProducts] = useState<VtexProduct[]>([])
	const [isLoadingProducts, setIsLoadingProducts] = useState(false)
	const [searchParams, setSearchParams] = useState<Record<string, unknown> | undefined>()

	useEffect(() => {
		executeProductSearch()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data])

	const executeProductSearch = async () => {
		setIsLoadingProducts(true)

		const params = {
			facets: data.facets || [],
			query: data.term ?? '',
			sort: data.sort ?? '',
			to: data.numberOfItems || 8
		}

		const result = await getProductsService(params)
		if (result) {
			setCurrentProducts(result.products ?? [])
			setSearchParams({ ...params, facets: data?.facets })
		}
		setIsLoadingProducts(false)
	}

	return (
		<ShelfOfProducts
			mode={data.mode || 'scroll'}
			title={data?.title}
			isLoading={isLoadingProducts}
			products={currentProducts}
			searchParams={searchParams}
		/>
	)
}
