import { useMemo, useCallback, useState, useEffect } from 'react'
import { useLocalShoppingCart } from '../../providers/LocalCart'
import { openProduct } from '../../services/NavigationService'
import { formatPrice } from '../../utils/utils'
import { App, Vtex } from 'eitri-shopping-vtex-shared'
import { ProductCardFullImage, TrackingService, getBadgesForProducts } from 'eitri-shopping-template-vtex-deco-shared'
import { useTranslation } from 'eitri-i18n'
import { useCartItem } from '../ProductCard/productCard.hooks'
import { formatInstallmentsShort, getFormattedListPrice } from '../ProductCard/productCard.utils'
import { useSnackBar } from '../../providers/SnackBar'
import type { VtexProduct, VtexSku, VtexSeller } from '../../types/vtex'

interface WishlistCardProps {
	product: VtexProduct
	onRemoveFromWishlist?: () => void
	[key: string]: unknown
}

export default function WishlistCard(props: WishlistCardProps) {
	const { product, onRemoveFromWishlist } = props

	const { addItem, cart } = useLocalShoppingCart()
	const { showSnackBar } = useSnackBar()
	const { t } = useTranslation()

	const [badges, setBadges] = useState<any[]>([])
	const [loadingCartOp, setLoadingCartOp] = useState(false)

	const item = useMemo<VtexSku | undefined>(() => {
		const availableSku = product.items?.find(sku =>
			sku.sellers?.some(seller => (seller.commertialOffer?.AvailableQuantity ?? 0) > 0)
		)
		return availableSku || product.items?.[0]
	}, [product])

	const sellerDefault = useMemo<VtexSeller | null>(() => {
		if (!item?.sellers?.length) return null
		return item.sellers.find(seller => seller.sellerDefault) || item.sellers[0]
	}, [item])

	const isValidProduct = Boolean(item && sellerDefault)

	const itemInCart = useCartItem(cart, item?.itemId)
	const itemQuantity = itemInCart?.quantity || 0

	const productData = useMemo(() => {
		if (!isValidProduct || !sellerDefault) return null
		const offer = sellerDefault.commertialOffer
		const priceVal = offer?.Price ?? 0
		const spotPriceVal = (offer as any)?.spotPrice ?? priceVal
		const price = Math.min(priceVal, spotPriceVal)
		return {
			name: product.productName || '',
			image: item?.images?.[0]?.imageUrl || '',
			listPrice: getFormattedListPrice(offer?.ListPrice, price),
			price: formatPrice(price),
			installments: formatInstallmentsShort(sellerDefault as any)
		}
	}, [product, item, sellerDefault, isValidProduct])

	useEffect(() => {
		if (!isValidProduct) return
		loadBadges()
	}, [isValidProduct])

	const loadBadges = async () => {
		try {
			const badgesResult = await getBadgesForProducts(product as any, item as any, Vtex, 'badges')
			setBadges(badgesResult || [])
		} catch (e) {
			console.error('Erro ao buscar badges', e)
		}
	}

	const handleCardPress = useCallback(() => {
		openProduct(product)
	}, [product])

	const handleAddToCart = useCallback(async () => {
		if (!item || loadingCartOp) return
		if ((product.items?.length ?? 0) > 1) {
			openProduct(product)
			return
		}
		try {
			setLoadingCartOp(true)
			if (addItem) {
				await addItem({ ...item, quantity: itemQuantity + 1 } as any)
			}
			TrackingService.addToCartEvent(product)
			showSnackBar?.('success', t('productCard.snackAdded'))
		} catch (error) {
			console.error('Error adding to cart:', error)
		} finally {
			setLoadingCartOp(false)
		}
	}, [item, loadingCartOp, product, itemQuantity, addItem, showSnackBar, t])

	const handleWishlistPress = useCallback(() => {
		if (onRemoveFromWishlist) onRemoveFromWishlist()
	}, [onRemoveFromWishlist])

	if (!isValidProduct || !productData) return null

	return (
		<ProductCardFullImage
			name={productData.name}
			image={productData.image}
			listPrice={productData.listPrice}
			showListItem={(App as any)?.configs?.appConfigs?.productCard?.showListPrice ?? true}
			price={productData.price}
			installments={productData.installments}
			badges={badges}
			isOnWishlist={true}
			itemQuantity={itemQuantity}
			loadingCartOp={loadingCartOp}
			onPressOnCard={handleCardPress}
			onPressMainAction={handleAddToCart}
			onPressOnWishlist={handleWishlistPress}
		/>
	)
}
