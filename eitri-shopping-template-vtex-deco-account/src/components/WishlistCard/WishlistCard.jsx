import { useMemo, useCallback, useState, useEffect } from 'react'
import { useLocalShoppingCart } from '../../providers/LocalCart'
import { openProduct } from '../../services/NavigationService'
import { formatPrice } from '../../utils/utils'
import { App, Vtex } from 'eitri-shopping-vtex-shared'
import { ProductCardFullImage, TrackingService, getBadgesForProducts } from 'eitri-shopping-monte-carlo-shared'
import { useTranslation } from 'eitri-i18n'
import { useCartItem } from '../ProductCard/productCard.hooks'
import { formatInstallmentsShort, getFormattedListPrice } from '../ProductCard/productCard.utils'
import { useSnackBar } from '../../providers/SnackBar'

export default function WishlistCard(props) {
	const { product, onRemoveFromWishlist } = props

	const { addItem, cart } = useLocalShoppingCart()
	const { showSnackBar } = useSnackBar()
	const { t } = useTranslation()

	const [badges, setBadges] = useState([])
	const [loadingCartOp, setLoadingCartOp] = useState(false)

	const item = useMemo(() => {
		const availableSku = product.items.find(sku =>
			sku.sellers.some(seller => seller.commertialOffer?.AvailableQuantity > 0)
		)
		return availableSku || product.items[0]
	}, [product])

	const sellerDefault = useMemo(() => {
		if (!item?.sellers?.length) return null
		return item.sellers.find(seller => seller.sellerDefault) || item.sellers[0]
	}, [item])

	const isValidProduct = Boolean(item && sellerDefault)

	const itemInCart = useCartItem(cart, item?.itemId)
	const itemQuantity = itemInCart?.quantity || 0

	const productData = useMemo(() => {
		if (!isValidProduct) return null
		const { Price, ListPrice, spotPrice } = sellerDefault.commertialOffer
		const price = Math.min(Price, spotPrice)
		return {
			name: product.productName,
			image: item.images?.[0]?.imageUrl || '',
			listPrice: getFormattedListPrice(ListPrice, price),
			price: formatPrice(price),
			installments: formatInstallmentsShort(sellerDefault)
		}
	}, [product, item, sellerDefault, isValidProduct])

	useEffect(() => {
		if (!isValidProduct) return
		loadBadges()
	}, [isValidProduct])

	const loadBadges = async () => {
		try {
			const badges = await getBadgesForProducts(product, item, Vtex, 'badges')
			setBadges(badges)
		} catch (e) {
			console.error('Erro ao buscar badges', e)
		}
	}

	const handleCardPress = useCallback(() => {
		openProduct(product)
	}, [product])

	const handleAddToCart = useCallback(async () => {
		if (!item || loadingCartOp) return
		if (product.items.length > 1) {
			openProduct(product)
			return
		}
		try {
			setLoadingCartOp(true)
			await addItem({ ...item, quantity: itemQuantity + 1 })
			TrackingService.addToCartEvent(product)
			showSnackBar('success', t('productCard.snackAdded'))
		} catch (error) {
			console.error('Error adding to cart:', error)
		} finally {
			setLoadingCartOp(false)
		}
	}, [item, loadingCartOp, itemQuantity, addItem, showSnackBar, t])

	const handleWishlistPress = useCallback(() => {
		if (onRemoveFromWishlist) onRemoveFromWishlist()
	}, [onRemoveFromWishlist])

	if (!isValidProduct || !productData) return null

	return (
		<ProductCardFullImage
			name={productData.name}
			image={productData.image}
			listPrice={productData.listPrice}
			showListItem={App?.configs?.appConfigs?.productCard?.showListPrice ?? true}
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
