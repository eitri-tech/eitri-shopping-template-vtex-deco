import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
// TEMPORÁRIO — hooks vêm do proxy CmsDependencies (injetados pelo app no DecoCMSContentRender).
import { useLocalShoppingCart } from '../../providers/CmsDependencies'
import { openCart, openProduct } from '../../services/NavigationService'
import { formatPrice } from '../../utils/price'
import { App, EventBus, Vtex } from 'eitri-shopping-vtex-shared'

import ProductCardFullImage from './ProductCardFullImage'
import TrackingService from '../../services/TrackingService'
import Datadog from '../../services/Datadog'
import getBadgesForProducts from '../../services/BadgesService'

import { useCartItem, useWishlist } from './productCard.hooks'
import { getProductVideo, formatInstallments, getFormattedListPrice } from './productCard.utils'
import MetalSwatches from './MetalSwatches'
import AddedToCartModal from '../AddedToCartModal/AddedToCartModal'
import type { Product, Sku, Seller } from '../../types/product'

export interface Props {
	product: Product
	siblings?: Product[]
	className?: string
}

// ========== Componente Principal ==========

export default function ProductCard({ product, siblings, className }: Props) {
	const { addItem, cart } = useLocalShoppingCart()

	const [badges, setBadges] = useState<any[]>([])
	const [loadingCartOp, setLoadingCartOp] = useState(false)
	const [showAddedToCartModal, setShowAddedToCartModal] = useState(false)

	const item = useMemo<Sku>(() => {
		if (product.items.some(item => !item?.sellers?.length)) {
			Datadog.sendDatadogInfoLog({ product }, 'productCard')
		}

		const availableSku = product.items.find(item =>
			item?.sellers?.some(seller => (seller.commertialOffer?.AvailableQuantity ?? 0) > 0)
		)
		return availableSku || product.items[0]
	}, [product])

	const sellerDefault = useMemo<Seller | null>(() => {
		if (!item?.sellers?.length) return null
		return item.sellers.find(seller => seller.sellerDefault) || item.sellers[0]
	}, [item])

	const isValidProduct = Boolean(item && sellerDefault)

	const itemInCart = useCartItem(cart, item?.itemId)

	const wishlist = useWishlist(product?.productId)

	const wishListIdRef = useRef(wishlist.wishListId)

	const productData = useMemo(() => {
		if (!isValidProduct || !sellerDefault) return null

		const { Price, ListPrice, spotPrice } = sellerDefault.commertialOffer

		return {
			name: product.productName,
			image: item.images?.[0]?.imageUrl || '',
			video: getProductVideo(product),
			listPrice: getFormattedListPrice(ListPrice, Math.min(Price, spotPrice)),
			discountPercentage: Math.round((1 - Math.min(Price, spotPrice) / ListPrice) * 100),
			price: formatPrice(Math.min(Price, spotPrice)),
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
					wishlist.setWishListId(data?.response?.data?.addToList)
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
		const badges = await getBadgesForProducts(product, item, Vtex, 'badges')
		setBadges(badges)
	}

	// ========== Ações do Carrinho ==========

	const addItemToCart = async (item: Sku, quantity = 1, goToCart?: boolean) => {
		try {
			setLoadingCartOp(true)
			await addItem({ ...item, quantity: itemQuantity + quantity })
			TrackingService.addToCartEvent(product)
			if (goToCart) {
				openCart()
			}
			setShowAddedToCartModal(true)
		} catch (error) {
			console.error('Error adding to cart:', error)
		} finally {
			setLoadingCartOp(false)
		}
	}

	const handleAddToCart = useCallback(async () => {
		if (!item || loadingCartOp) return

		if (product.items.length > 1) {
			openProduct(product)
			return
		}

		await addItemToCart(item)
	}, [item, loadingCartOp, addItem])

	// ========== Ações de Navegação ==========

	const handleCardPress = useCallback(() => {
		openProduct(product)
	}, [product])

	const handleWishlistPress = useCallback(() => {
		wishlist.toggle(item?.name ?? '', item?.itemId)
	}, [wishlist, item])

	// ========== Renderização ==========

	// Retorna null se o produto for inválido
	if (!isValidProduct || !productData) {
		return null
	}

	// Monta os parâmetros para o componente de apresentação
	const swatches = (
		<MetalSwatches
			currentProductId={product.productId}
			siblings={siblings}
			onSwatchPress={openProduct}
		/>
	)

	const params = {
		name: productData.name,
		image: productData.image,
		video: productData.video,
		listPrice: productData.listPrice,
		showListItem: (App as any)?.configs?.appConfigs?.productCard?.showListPrice ?? false,
		showWishlist: true,
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
		swatches,
		className
	}

	const Implementation = ProductCardFullImage

	return (
		<>
			{React.createElement(Implementation, params)}
			<AddedToCartModal
				open={showAddedToCartModal}
				product={{
					name: productData.name,
					image: productData.image,
					price: productData.price,
					listPrice: productData.listPrice
				}}
				onClose={() => setShowAddedToCartModal(false)}
				onGoToCart={() => {
					setShowAddedToCartModal(false)
					openCart()
				}}
			/>
		</>
	)
}
