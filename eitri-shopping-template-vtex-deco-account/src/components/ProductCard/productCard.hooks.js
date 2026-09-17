import { useState, useEffect, useMemo, useCallback } from 'react'
import { addToWishlist, productOnWishlist, removeItemFromWishlist } from '../../services/CustomerService'

export const useCartItem = (cart, itemId) => {
	return useMemo(() => {
		if (!cart?.items || !itemId) return null

		const index = cart.items.findIndex(cartItem => cartItem.id === itemId)
		if (index === -1) return null

		return { ...cart.items[index], index }
	}, [cart, itemId])
}

export const useWishlist = productId => {
	const [isOnWishlist, setIsOnWishlist] = useState(false)
	const [wishListId, setWishListId] = useState(null)
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
				if (inList) setWishListId(listId)
			} catch (error) {
				console.error('Error checking wishlist:', error)
			} finally {
				setLoading(false)
			}
		}

		checkWishlist()
	}, [productId])

	const addToList = useCallback(
		async (itemName, itemId) => {
			if (!productId) return

			try {
				setLoading(true)
				setIsOnWishlist(true)
				const response = await addToWishlist(productId, itemName, itemId)
				setWishListId(response?.data?.addToList)
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
			await removeItemFromWishlist(wishListId)
		} catch (error) {
			console.error('Error removing from wishlist:', error)
			setIsOnWishlist(true)
		} finally {
			setLoading(false)
		}
	}, [wishListId])

	const toggle = useCallback(
		async (itemName, itemId) => {
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
