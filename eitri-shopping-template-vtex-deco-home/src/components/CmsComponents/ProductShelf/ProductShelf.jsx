import { getProductsService } from '../../../services/ProductService'
import ShelfOfProducts from '../../ShelfOfProducts/ShelfOfProducts'
export default function ProductShelf(props) {
	const { data } = props

	const [currentProducts, setCurrentProducts] = useState([])
	const [isLoadingProducts, setIsLoadingProducts] = useState(false)
	const [searchParams, setSearchParams] = useState()

	useEffect(() => {
		executeProductSearch()
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
			setCurrentProducts(result.products)
			setSearchParams({ facets: data?.facets, ...params })
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
