import { getProductById } from '../../services/ProductService'
import WishlistCard from '../WishlistCard/WishlistCard'

export default function WishlistItem(props) {
	const { productId, onRemoveFromWishlist } = props

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

	return <>{product && <WishlistCard product={product} onRemoveFromWishlist={onRemoveFromWishlist} />}</>
}
