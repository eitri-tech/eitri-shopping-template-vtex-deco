import { useState, useEffect, useCallback, useMemo } from 'react'
// Fixed import casing: the real file is `customerService.ts` (lowercase c) — the original
// `CustomerService` import only resolved by accident on case-insensitive filesystems.
import { addToWishlist, productOnWishlist, removeItemFromWishlist } from '../../services/customerService'
import type { VtexCart, VtexCartItem } from '../../types/vtex'

export const useCartItem = (cart: VtexCart | null | undefined, itemId?: string) => {
	return useMemo<(VtexCartItem & { index: number }) | null>(() => {
		if (!cart?.items || !itemId) return null

		const index = cart.items.findIndex(cartItem => cartItem.id === itemId)
		if (index === -1) return null

		return { ...cart.items[index], index }
	}, [cart, itemId])
}

export const useWishlist = (productId?: string) => {
	const [isOnWishlist, setIsOnWishlist] = useState(false)
	const [wishListId, setWishListId] = useState<string | number | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (!productId) {
			setLoading(false)
			return
		}

		const checkWishlist = async () => {
			try {
				const { inList, listId } = await productOnWishlist(productId)
				setIsOnWishlist(inList)
				if (inList) setWishListId(listId ?? null)
			} catch (error) {
				console.error('Error checking wishlist:', error)
			} finally {
				setLoading(false)
			}
		}

		checkWishlist()
	}, [productId])

	const addToList = useCallback(
		async (itemName?: string, itemId?: string) => {
			if (!productId) return

			try {
				setLoading(true)
				setIsOnWishlist(true)
				const result = await addToWishlist(productId, itemName ?? '', itemId ?? '')
				setWishListId((result as { data?: { addToList?: string } })?.data?.addToList ?? null)
			} catch (error) {
				console.error('Error adding to wishlist:', error)
				setIsOnWishlist(false)
			} finally {
				setLoading(false)
			}
		},
		[productId]
	)

	const removeFromList = useCallback(async () => {
		if (!wishListId) return

		try {
			setLoading(true)
			setIsOnWishlist(false)
			await removeItemFromWishlist(String(wishListId))
		} catch (error) {
			console.error('Error removing from wishlist:', error)
			setIsOnWishlist(true)
		} finally {
			setLoading(false)
		}
	}, [wishListId])

	const toggle = useCallback(
		async (itemName?: string, itemId?: string) => {
			if (loading) return

			if (isOnWishlist) {
				await removeFromList()
			} else {
				await addToList(itemName, itemId)
			}
		},
		[loading, isOnWishlist, removeFromList, addToList]
	)

	return { isOnWishlist, loading, wishListId, setIsOnWishlist, toggle, setWishListId }
}
