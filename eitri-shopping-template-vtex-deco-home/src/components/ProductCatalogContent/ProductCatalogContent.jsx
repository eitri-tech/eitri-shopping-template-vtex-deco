import { useEffect, useRef, useCallback, useState } from 'react'
import { View } from 'eitri-luminus'
import { useTranslation } from 'eitri-i18n'
import { getProductsService, getProductSiblingsService } from '../../services/ProductService'
import { getAgrupadorCode, groupSiblingsByCode } from 'eitri-shopping-template-vtex-deco-shared'
import SearchResults from '../PageSearchComponents/SearchResults'
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
	const { params, showFilters, banner, title, hiddenSortOptions = [], ...rest } = props
	const { t } = useTranslation()

	const [productLoading, setProductLoading] = useState(false)
	const [products, setProducts] = useState([])
	const [totalProducts, setTotalProducts] = useState(0)
	const [appliedFacets, setAppliedFacets] = useState([]) // Filtros efetivamente usados na busca
	const [currentPage, setCurrentPage] = useState(1)
	const [pagesHasEnded, setPageHasEnded] = useState(false)
	const [siblingsByCode, setSiblingsByCode] = useState({})
	const fetchedCodesRef = useRef(new Set())

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

			fetchedCodesRef.current = new Set()
			setSiblingsByCode({})
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
			loadSiblings(result.products)
			setProductLoading(false)
		} catch (error) {
			console.log('error', error)
			setProductLoading(false)
		}
	}

	const loadSiblings = async pageProducts => {
		try {
			const codes = [...new Set(pageProducts.map(getAgrupadorCode).filter(Boolean))]
			const newCodes = codes.filter(code => !fetchedCodesRef.current.has(code))
			if (newCodes.length === 0) return
			newCodes.forEach(code => fetchedCodesRef.current.add(code))
			const siblingProducts = await getProductSiblingsService(newCodes)
			const grouped = groupSiblingsByCode(siblingProducts)
			setSiblingsByCode(prev => ({ ...prev, ...grouped }))
		} catch (error) {
			console.error('Error loading product siblings', error)
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
		fetchedCodesRef.current = new Set()
		setSiblingsByCode({})
		getProducts(newParams, 1)
	}

	const handleFilterChange = filters => {
		setAppliedFacets(filters)
		setProducts([])
		setCurrentPage(1)
		setPageHasEnded(false)
		fetchedCodesRef.current = new Set()
		setSiblingsByCode({})
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
					{totalProducts > 0 && (
						<View className='px-4 pt-5 pb-3'>
							<Text className='text-base text-black'>
								{t(
									totalProducts === 1
										? 'productCatalog.resultCountSingle'
										: 'productCatalog.resultCountMultiple',
									{ count: totalProducts }
								)}
							</Text>
						</View>
					)}

					<View className='mx-4 mb-5 flex w-auto gap-4'>
						<View className='flex-1'>
							<CatalogFilter
								minPriceRange={minPriceRange}
								setMinPriceRange={setMinPriceRange}
								maxPriceRange={maxPriceRange}
								setMaxPriceRange={setMaxPriceRange}
								currentFilters={appliedFacets}
								onFilterChange={handleFilterChange}
								onFilterClear={onFilterClear}
							/>
						</View>
						<View className='flex-1'>
							<CatalogSort
								currentSort={appliedFacets?.sort}
								onSortChange={handleSortChange}
								hiddenSortOptions={hiddenSortOptions}
							/>
						</View>
					</View>
				</>
			)}

			<InfiniteScroll onScrollEnd={onScrollEnd}>
				<SearchResults
					isLoading={productLoading}
					searchResults={products}
					siblingsByCode={siblingsByCode}
				/>
			</InfiniteScroll>
		</View>
	)
}
