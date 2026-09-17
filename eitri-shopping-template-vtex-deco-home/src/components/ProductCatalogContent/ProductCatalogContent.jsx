import { useEffect } from 'react'
import { View } from 'eitri-luminus'
import { getProductsService } from '../../services/ProductService'
import { useState } from 'react'
import SearchResults from '../../components/PageSearchComponents/SearchResults'
import CatalogSort from './Components/CatalogSort'
import { getDefaultSortParam } from '../../services/helpers/resolveSortParam'
import CatalogFilter from './Components/CatalogFilter'
import InfiniteScroll from '../InfiniteScroll/InfiniteScroll'

export default function ProductCatalogContent(props) {
	/*
	 * props:
	 *
	 * params: {
	 *  facets: Array<{ key: string, value: string }>
	 *  query: string
	 *  sort: string
	 * }
	 * */
	const { params, showFilters, banner, ...rest } = props

	const [productLoading, setProductLoading] = useState(false)
	const [products, setProducts] = useState([])
	const [totalProducts, setTotalProducts] = useState(0)
	const [appliedFacets, setAppliedFacets] = useState([]) // Filtros efetivamente usados na busca
	const [currentPage, setCurrentPage] = useState(1)
	const [pagesHasEnded, setPageHasEnded] = useState(false)

	const [minPriceRange, setMinPriceRange] = useState(null)
	const [maxPriceRange, setMaxPriceRange] = useState(null)

	useEffect(() => {
		if (params) {
			// Criar uma cópia limpa dos parâmetros para evitar mutação
			const initialParams = getInitialParams()

			setAppliedFacets(initialParams)
			setProducts([])
			setPageHasEnded(false)
			setCurrentPage(1)

			getProducts(initialParams, 1)
		}
	}, [params])

	// Normaliza os parâmetros iniciais
	const getInitialParams = useCallback(() => {
		if (!params) return null

		return {
			...params,
			sort: params.sort || getDefaultSortParam(true),
			facets: Array.isArray(params.facets) ? params.facets : []
		}
	}, [params])

	const getProducts = async (selectedFacets, page) => {
		try {
			if (productLoading || pagesHasEnded) return

			// Validar parâmetros antes de fazer a requisição
			if (!selectedFacets || typeof selectedFacets !== 'object') {
				console.error('Invalid selectedFacets provided to getProducts')
				setProductLoading(false)
				return
			}

			setProductLoading(true)

			const result = await getProductsService(selectedFacets, page)

			if (result?.products?.length === 0) {
				setProductLoading(false)
				setPageHasEnded(true)
				return
			}

			const loadedProducts = page === 1 ? result.products.length : products.length + result.products.length

			setPageHasEnded(loadedProducts > result.recordsFiltered)
			setProducts(prev => (page === 1 ? result.products : [...prev, ...result.products]))
			setTotalProducts(result?.recordsFiltered)
			setCurrentPage(page)
			setProductLoading(false)
		} catch (error) {
			console.log('error', error)
			setProductLoading(false)
		}
	}

	const onScrollEnd = async () => {
		if (!productLoading && !pagesHasEnded) {
			const newPage = currentPage + 1
			getProducts(appliedFacets, newPage)
		}
	}

	const handleSortChange = newSort => {
		const newParams = {
			...appliedFacets,
			sort: newSort
		}
		setAppliedFacets(newParams)
		setProducts([])
		setCurrentPage(1)
		setPageHasEnded(false)
		getProducts(newParams, 1)
	}

	const handleFilterChange = filters => {
		setAppliedFacets(filters)
		setProducts([])
		setCurrentPage(1)
		setPageHasEnded(false)
		getProducts(filters, 1)
	}

	const onFilterClear = () => {
		const initialFilters = getInitialParams()
		handleFilterChange(initialFilters)
	}

	return (
		<View {...rest}>
			{banner && (
				<Image
					src={banner}
					className='w-full object-cover'
				/>
			)}

			{products.length > 0 && showFilters && (
				<>
					<View className='p-4 flex flex-between gap-4 w-full'>
						<CatalogFilter
							minPriceRange={minPriceRange}
							setMinPriceRange={setMinPriceRange}
							maxPriceRange={maxPriceRange}
							setMaxPriceRange={setMaxPriceRange}
							currentFilters={appliedFacets}
							onFilterChange={handleFilterChange}
							onFilterClear={onFilterClear}
						/>
						<CatalogSort
							currentSort={appliedFacets?.sort}
							onSortChange={handleSortChange}
						/>
					</View>

					{totalProducts > 0 && (
						<View className='px-4'>
							<Text>
								{`Exibindo ${
									totalProducts > 1 ? `${totalProducts} produtos` : `${totalProducts} produto`
								}`}
							</Text>
						</View>
					)}
				</>
			)}

			<InfiniteScroll onScrollEnd={onScrollEnd}>
				<SearchResults
					isLoading={productLoading}
					searchResults={products}
				/>
			</InfiniteScroll>
		</View>
	)
}
