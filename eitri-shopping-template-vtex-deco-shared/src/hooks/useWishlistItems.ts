import { useCallback, useEffect, useState } from 'react'
import { EventBus, EventBusChannels } from 'eitri-shopping-vtex-shared'
import { getWishlist } from '../services/CustomerService'
import { getProductById } from '../services/ProductService'
import ensureVtexConfigured from '../utils/ensureVtexConfigured'
import type { Product } from '../types/product'

interface WishlistItemsState {
	items: Product[]
	isLoading: boolean
}

/**
 * Produtos favoritados pelo usuário logado. Refaz a busca quando o SDK da VTEX
 * publica addToWishlist/removeFromWishlist — os mesmos canais que o ProductCard
 * escuta pra manter o coração em sincronia entre telas.
 */
export default function useWishlistItems(): WishlistItemsState {
	const [items, setItems] = useState<Product[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const load = useCallback(async () => {
		try {
			setIsLoading(true)
			await ensureVtexConfigured()
			const wishlist = await getWishlist()
			const products = await Promise.all(wishlist.map((entry: any) => getProductById(entry.productId)))
			setItems(products.filter(Boolean))
		} catch (error) {
			console.error('[useWishlistItems] Falha ao carregar a lista de favoritos', error)
			setItems([])
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		load()
		EventBus.subscribe({ channel: 'addToWishlist', broadcast: true, callback: load })
		EventBus.subscribe({ channel: 'removeFromWishlist', broadcast: true, callback: load })
		EventBus.subscribe({ channel: EventBusChannels.USER_LOGGED_IN, broadcast: true, callback: load })
		EventBus.subscribe({
			channel: EventBusChannels.USER_LOGGED_OUT,
			broadcast: true,
			callback: () => setItems([])
		})
	}, [load])

	return { items, isLoading }
}
