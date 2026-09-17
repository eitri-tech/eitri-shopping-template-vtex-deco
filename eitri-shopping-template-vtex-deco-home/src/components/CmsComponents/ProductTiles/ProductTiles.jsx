import { getProductsService } from '../../../services/ProductService'
import { Text, View } from 'eitri-luminus'
import ShelfOfProducts from '../../ShelfOfProducts/ShelfOfProducts'
import SectionTitle from '../../SectionTitle/SectionTitle'

export default function ProductTiles(props) {
	const { data } = props
	const [shelves, setShelves] = useState([])
	const [currentShelf, setCurrentShelf] = useState({})
	const [currentProducts, setCurrentProducts] = useState([])
	const [isLoadingProducts, setIsLoadingProducts] = useState(false)
	const [cachedProducts, setCachedProducts] = useState({})

	useEffect(() => {
		if (data?.shelves) {
			setShelves(data.shelves)
			setCurrentShelf(data.shelves[0])
		}
	}, [data])

	useEffect(() => {
		executeProductSearch(currentShelf)
	}, [currentShelf])

	const executeProductSearch = async shelf => {
		try {
			if (cachedProducts[shelf.title]) {
				setCurrentProducts(cachedProducts[shelf.title])
				return
			}

			setIsLoadingProducts(true)

			const params = {
				facets: shelf.facets || [],
				query: shelf.term ?? '',
				sort: shelf.sort ?? '',
				to: shelf.numberOfItems || 8
			}

			const result = await getProductsService(params)

			setCurrentProducts(result.products)
			setIsLoadingProducts(false)
			setCachedProducts({
				...cachedProducts,
				[shelf.title]: result.products
			})
		} catch (e) {
			console.error('executeProductSearch.error', e)
		}
	}

	const onChooseShelf = shelf => {
		setCurrentShelf(structuredClone(shelf))
	}

	return (
		<View>
			<SectionTitle title={data?.title} />
			<View className='overflow-x-auto flex px-4 gap-2 mb-1'>
				{shelves?.map(shelf => (
					<View
						key={shelf.title}
						onClick={() => onChooseShelf(shelf)}
						className={`py-1 px-3 border min-w-fit rounded ${
							shelf.title === currentShelf.title ? 'border-primary' : 'border-neutral-400'
						}`}>
						<Text className={`${shelf.title === currentShelf.title ? 'text-primary' : 'text-neutral-400'}`}>
							{shelf.title}
						</Text>
					</View>
				))}
			</View>
			<ShelfOfProducts
				mode={data.mode || 'scroll'}
				isLoading={isLoadingProducts}
				products={currentProducts}
			/>
		</View>
	)
}
