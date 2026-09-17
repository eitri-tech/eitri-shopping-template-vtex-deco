import { getProductById } from '../../services/ProductService'
import ProductCard from '../ProductCard/ProductCard'

export default function WishlistItem(props) {
	const { productId } = props

	const [product, setProduct] = useState(null)

	useEffect(() => {
		init(productId)
	}, [productId])

	const init = async () => {
		try {
			const product = await getProductById(productId)
			setProduct(product)
		} catch (e) {
			console.error('Erro ao buscar produto', e)
		}
	}

	return <>{product && <ProductCard product={product} />}</>
}
