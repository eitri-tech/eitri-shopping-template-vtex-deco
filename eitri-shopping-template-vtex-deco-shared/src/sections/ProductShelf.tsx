import { useEffect, useState } from 'react'
import { getProductsService } from '../services/ProductService'
import ShelfOfProducts from '../components/ShelfOfProducts/ShelfOfProducts'
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
	 * @title Quantidade de itens.
	 */
	numberOfItems?: number
	/**
	 * @title Modo de exibição (scroll | carousel).
	 */
	mode?: string
}

export default function ProductShelf({
	title,
	facets = [],
	term = '',
	sort = '',
	numberOfItems = 8,
	mode = 'scroll'
}: Props) {
	const [currentProducts, setCurrentProducts] = useState<any[]>([])
	const [isLoadingProducts, setIsLoadingProducts] = useState(false)
	const [searchParams, setSearchParams] = useState<any>()

	// Chave primitiva evita loop de efeito quando `facets` chega como novo array a cada render.
	const facetsKey = JSON.stringify(facets)

	useEffect(() => {
		executeProductSearch()
	}, [facetsKey, term, sort, numberOfItems])

	const executeProductSearch = async () => {
		setIsLoadingProducts(true)

		const params = {
			facets: facets || [],
			query: term ?? '',
			sort: sort ?? '',
			to: numberOfItems || 8
		}

		const result = await getProductsService(params)
		if (result) {
			setCurrentProducts(result.products)
			setSearchParams(params)
		}
		setIsLoadingProducts(false)
	}

	return (
		<ShelfOfProducts
			mode={mode || 'scroll'}
			title={title}
			isLoading={isLoadingProducts}
			products={currentProducts}
			searchParams={searchParams}
		/>
	)
}
