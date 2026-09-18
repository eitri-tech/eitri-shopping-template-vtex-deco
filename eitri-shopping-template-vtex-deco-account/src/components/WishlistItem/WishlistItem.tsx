import { useEffect, useState } from 'react'
import { getProductById } from '../../services/ProductService'
import WishlistCard from '../WishlistCard/WishlistCard'
import type { VtexProduct } from '../../types/vtex'

interface WishlistItemProps {
	productId?: string
	onRemoveFromWishlist?: () => void
}

export default function WishlistItem(props: WishlistItemProps) {
	const { productId, onRemoveFromWishlist } = props

	const [product, setProduct] = useState<VtexProduct | null>(null)

	useEffect(() => {
		init(productId)
	}, [productId])

	const init = async (productId?: string) => {
		if (!productId) return
		try {
			const product = await getProductById(productId)
			setProduct(product)
		} catch (e) {
			console.error('Erro ao buscar produto', e)
		}
	}

	return <>{product && <WishlistCard product={product} onRemoveFromWishlist={onRemoveFromWishlist} />}</>
}
