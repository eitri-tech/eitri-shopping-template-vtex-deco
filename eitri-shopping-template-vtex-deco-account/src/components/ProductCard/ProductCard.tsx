import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useLocalShoppingCart } from '../../providers/LocalCart'
import { openCart, openProduct } from '../../services/NavigationService'
import { formatPrice } from '../../utils/utils'
import { App, EventBus } from 'eitri-shopping-vtex-shared'
import { Datadog, ProductCardFullImage, TrackingService, getBadgesForProducts } from 'eitri-shopping-template-vtex-deco-shared'
import { Vtex } from 'eitri-shopping-vtex-shared'
import { useSnackBar } from '../../providers/SnackBar'
import { useTranslation } from 'eitri-i18n'
import type { VtexProduct } from '../../types/vtex'

import { useCartItem, useWishlist } from './productCard.hooks'
import { getProductVideo, formatInstallments, getFormattedListPrice } from './productCard.utils'

// ========== Componente Principal ==========

interface ProductCardProps {
	product: VtexProduct
	className?: string
}

export default function ProductCard(props: ProductCardProps) {
	const { product, className } = props
	const { addItem, cart } = useLocalShoppingCart()
	const { showSnackBar } = useSnackBar()
	const { t } = useTranslation()

	const [badges, setBadges] = useState<unknown[]>([])
	const [loadingCartOp, setLoadingCartOp] = useState(false)

	const item = useMemo(() => {
		if (product.items?.some(item => !item?.sellers?.length)) {
			Datadog.sendDatadogInfoLog({ product }, 'productCard')
		}

		const availableSku = product.items?.find(item =>
			item.sellers?.some(seller => (seller.commertialOffer?.AvailableQuantity ?? 0) > 0)
		)
		return availableSku || product.items?.[0]
	}, [product])

	const sellerDefault = useMemo(() => {
		if (!item?.sellers?.length) return null
		return item.sellers.find(seller => seller.sellerDefault) || item.sellers[0]
	}, [item])

	const isValidProduct = Boolean(item && sellerDefault)

	const itemInCart = useCartItem(cart, item?.itemId)

	const wishlist = useWishlist(product?.productId)

	const wishListIdRef = useRef(wishlist.wishListId)

	const productData = useMemo(() => {
		if (!isValidProduct || !sellerDefault || !item) return null

		const { Price, ListPrice, spotPrice } = sellerDefault.commertialOffer ?? {}
		const bestPrice = Math.min(Price ?? 0, spotPrice ?? Price ?? 0)

		return {
			name: product.productName,
			image: item.images?.[0]?.imageUrl || '',
			video: getProductVideo(product),
			listPrice: getFormattedListPrice(ListPrice, bestPrice),
			discountPercentage: ListPrice ? Math.round((1 - bestPrice / ListPrice) * 100) : 0,
			price: formatPrice(bestPrice),
			installments: formatInstallments(sellerDefault)
		}
	}, [product, item, sellerDefault, isValidProduct])

	const rating = null

	const itemQuantity = itemInCart?.quantity || 0

	useEffect(() => {
		wishListIdRef.current = wishlist.wishListId
	}, [wishlist.wishListId])

	useEffect(() => {
		loadBadges()
		EventBus.subscribe({
			channel: 'addToWishlist',
			broadcast: true,
			callback: (data: any) => {
				if (data?.productId === product.productId) {
					wishlist.setIsOnWishlist(true)
					wishlist.setWishListId(data?.response?.data?.addToList ?? null)
				}
			}
		})
		EventBus.subscribe({
			channel: 'removeFromWishlist',
			broadcast: true,
			callback: (data: any) => {
				if (data?.id === wishListIdRef.current && data?.response?.data?.removeFromList) {
					wishlist.setIsOnWishlist(false)
					wishlist.setWishListId(-1)
				}
			}
		})
	}, [])

	// ========== badges
	const loadBadges = async () => {
		if (!item) return
		const badges = await getBadgesForProducts(product, item, Vtex as any, 'badges')
		setBadges(badges)
	}

	// ========== Ações do Carrinho ==========

	const handleAddToCart = useCallback(async () => {
		if (!item || loadingCartOp) return

		if ((product.items?.length ?? 0) > 1) {
			openProduct(product)
			return
		}

		await addItemToCart(item)
	}, [item, loadingCartOp, addItem])

	const addItemToCart = async (item: unknown, quantity = 1, goToCart?: boolean) => {
		try {
			setLoadingCartOp(true)
			await addItem?.({ ...(item as object), quantity: itemQuantity + quantity } as any)
			TrackingService.addToCartEvent(product)
			if (goToCart) {
				openCart()
			}
			showSnackBar?.('success', t('productCard.snackAdded'))
		} catch (error) {
			console.error('Error adding to cart:', error)
		} finally {
			setLoadingCartOp(false)
		}
	}

	// ========== Ações de Navegação ==========

	const handleCardPress = useCallback(() => {
		openProduct(product)
	}, [product])

	const handleWishlistPress = useCallback(() => {
		wishlist.toggle(item?.name, item?.itemId)
	}, [wishlist, item])

	// ========== Renderização ==========

	if (!isValidProduct || !productData) {
		return null
	}

	const params = {
		name: productData.name,
		image: productData.image,
		video: productData.video,
		listPrice: productData.listPrice,
		showListItem: (App as any)?.configs?.appConfigs?.productCard?.showListPrice ?? true,
		rating: rating,
		price: productData.price,
		discountPercentage: productData.discountPercentage,
		badges,
		installments: productData.installments,
		isInCart: Boolean(itemInCart),
		isOnWishlist: wishlist.isOnWishlist,
		loadingWishlistOp: wishlist.loading,
		loadingCartOp,
		itemQuantity,
		imageAspectRatio: (App as any)?.configs?.appConfigs?.productCardImageAspectRatio,
		onPressOnCard: handleCardPress,
		onPressMainAction: handleAddToCart,
		onPressOnWishlist: handleWishlistPress,
		className
	}

	const Implementation = ProductCardFullImage

	return React.createElement(Implementation, params as any)
}
