import { useEffect, useState } from 'react'
import { getProductById } from '../../services/ProductService'
import ProductCard from '../ProductCard/ProductCard'
import type { VtexProduct } from '../../types/vtex'

interface WishlistItemProps {
	productId?: string
	// Accepted by callers (Wishlist.jsx) but never wired up here — pre-existing, kept as a no-op.
	onRemoveFromWishlist?: () => void
}

export default function WishlistItem(props: WishlistItemProps) {
	const { productId } = props

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

	return <>{product && <ProductCard product={product} />}</>
}
