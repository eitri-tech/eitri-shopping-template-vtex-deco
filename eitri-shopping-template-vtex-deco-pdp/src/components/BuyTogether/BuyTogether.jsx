import { Image, Text, View } from 'eitri-luminus'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'eitri-i18n'
import { TrackingService } from 'eitri-shopping-template-vtex-deco-shared'
import { showTogether } from '../../services/productService'
import { useLocalShoppingCart } from '../../providers/LocalCart'
import { useSnackBar } from '../../providers/SnackBar'
import { formatAmount } from '../../utils/utils'

function getAvailableSku(product) {
	return (
		product?.items?.find(item => item?.sellers?.some(seller => seller?.commertialOffer?.AvailableQuantity > 0)) ||
		null
	)
}

function getAvailableSeller(sku) {
	const sellers = sku?.sellers || []
	return (
		sellers.find(seller => seller?.sellerDefault && seller?.commertialOffer?.AvailableQuantity > 0) ||
		sellers.find(seller => seller?.commertialOffer?.AvailableQuantity > 0) ||
		null
	)
}

function getMainSeller(sku) {
	const sellers = sku?.sellers || []
	return (
		getAvailableSeller(sku) ||
		sellers.find(seller => seller?.sellerDefault) ||
		sellers[0]
	)
}

function getPrice(sku) {
	return getMainSeller(sku)?.commertialOffer?.Price || 0
}

function getInstallment(sku) {
	const installments = getMainSeller(sku)?.commertialOffer?.Installments || []
	const interestFreeInstallments = installments.filter(installment => installment.InterestRate === 0)

	return interestFreeInstallments.reduce((best, installment) => {
		if (!best || installment.NumberOfInstallments > best.NumberOfInstallments) {
			return installment
		}
		return best
	}, null)
}

export default function BuyTogether(props) {
	const { product, currentSku } = props
	const { t } = useTranslation()
	const { addItems } = useLocalShoppingCart()
	const { showSnackBar } = useSnackBar()
	const [recommendations, setRecommendations] = useState([])
	const [selectedProductIds, setSelectedProductIds] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [isBuying, setIsBuying] = useState(false)

	useEffect(() => {
		loadRecommendations()
	}, [product?.productId])

	const loadRecommendations = async () => {
		if (!product?.productId) return

		setIsLoading(true)
		setRecommendations([])
		setSelectedProductIds([])

		try {
			const products = await showTogether(product.productId)
			const availableProducts = (products || [])
				.filter(
					recommendedProduct =>
						String(recommendedProduct?.productId) !== String(product.productId)
				)
				.map(recommendedProduct => ({
					product: recommendedProduct,
					sku: getAvailableSku(recommendedProduct)
				}))
				.filter(recommendation => recommendation.sku)
				.slice(0, 1)

			setRecommendations(availableProducts)
		} catch (error) {
			console.error('Erro ao carregar produtos para compra conjunta', error)
		} finally {
			setIsLoading(false)
		}
	}

	const selectedRecommendations = useMemo(
		() =>
			recommendations.filter(recommendation =>
				selectedProductIds.includes(String(recommendation.product.productId))
			),
		[recommendations, selectedProductIds]
	)

	const combinationPrice = useMemo(() => {
		return recommendations.reduce(
			(total, recommendation) => total + getPrice(recommendation.sku),
			getPrice(currentSku)
		)
	}, [currentSku, recommendations])

	const selectedPrice = useMemo(() => {
		const currentProductPrice = selectedProductIds.includes(String(product.productId))
			? getPrice(currentSku)
			: 0

		return selectedRecommendations.reduce(
			(total, recommendation) => total + getPrice(recommendation.sku),
			currentProductPrice
		)
	}, [currentSku, product.productId, selectedProductIds, selectedRecommendations])

	const toggleProduct = productId => {
		const normalizedProductId = String(productId)
		setSelectedProductIds(currentIds => {
			if (currentIds.includes(normalizedProductId)) {
				return currentIds.filter(currentId => currentId !== normalizedProductId)
			}
			return [...currentIds, normalizedProductId]
		})
	}

	const getCartItemPayload = sku => {
		return {
			id: sku.itemId,
			quantity: 1,
			seller: getMainSeller(sku)?.sellerId
		}
	}

	const allProductsSelected =
		!!getAvailableSeller(currentSku) &&
		recommendations.length > 0 &&
		selectedProductIds.includes(String(product.productId)) &&
		recommendations.every(recommendation =>
			selectedProductIds.includes(String(recommendation.product.productId))
		)

	const handleBuyTogether = async () => {
		if (!currentSku || !allProductsSelected || isBuying) return

		setIsBuying(true)
		try {
			const recommendation = recommendations[0]
			await addItems([
				getCartItemPayload(currentSku),
				getCartItemPayload(recommendation.sku)
			])

			TrackingService.addToCartEvent(product)
			TrackingService.addToCartEvent(recommendation.product)

			showSnackBar('success', t('buyTogether.snackAdded'))
		} catch (error) {
			console.error('Erro ao adicionar compra conjunta à sacola', error)
		} finally {
			setIsBuying(false)
		}
	}

	if (isLoading) {
		return (
			<View className='mt-6 flex flex-col gap-4'>
				<View className='mx-4 h-6 w-[140px] self-center rounded bg-gray-200 animate-pulse' />
				<View className='flex gap-4 overflow-hidden px-4'>
					<View className='h-[280px] min-w-[198px] rounded bg-gray-200 animate-pulse' />
					<View className='h-[280px] min-w-[198px] rounded bg-gray-200 animate-pulse' />
				</View>
			</View>
		)
	}
	if (!getAvailableSeller(currentSku) || recommendations.length === 0) return null

	const canBuy = allProductsSelected && !isBuying

	return (
		<View className='mt-6 flex flex-col gap-5'>
			<Text className='text-center text-xl font-bold'>{t('buyTogether.txtTitle')}</Text>

			<View className='flex overflow-x-auto'>
				<View className='flex flex-row items-start gap-3 px-4'>
					<BuyTogetherCard
						product={product}
						sku={currentSku}
						isSelected={selectedProductIds.includes(String(product.productId))}
						onToggle={() => toggleProduct(product.productId)}
					/>

					{recommendations.map(recommendation => (
						<View
							key={recommendation.product.productId}
							className='flex flex-row items-start gap-3'>
							<View className='flex h-[154px] items-center justify-center'>
								<Text className='text-2xl font-light'>+</Text>
							</View>
							<BuyTogetherCard
								product={recommendation.product}
								sku={recommendation.sku}
								isSelected={selectedProductIds.includes(String(recommendation.product.productId))}
								onToggle={() => toggleProduct(recommendation.product.productId)}
							/>
						</View>
					))}
				</View>
			</View>

			<View className='flex flex-col items-center gap-1 px-4'>
				<Text className='text-lg font-bold'>
					{t('buyTogether.total', { value: formatAmount(combinationPrice) })}
				</Text>
				<Text className='text-sm text-gray-600'>
					{t('buyTogether.selectedValue', { value: formatAmount(selectedPrice) })}
				</Text>
				<View
					onClick={canBuy ? handleBuyTogether : undefined}
					className={`mt-2 flex h-11 w-[198px] items-center justify-center ${
						canBuy ? 'bg-black cursor-pointer' : 'bg-gray-300'
					}`}>
					<Text className='font-bold text-white'>
						{isBuying ? t('buyTogether.buying') : t('buyTogether.buy')}
					</Text>
				</View>
			</View>
		</View>
	)
}

function BuyTogetherCard(props) {
	const { product, sku, isSelected, onToggle } = props
	const { t } = useTranslation()
	const seller = getMainSeller(sku)
	const price = seller?.commertialOffer?.Price
	const installment = getInstallment(sku)
	const imageUrl = sku?.images?.[0]?.imageUrl

	return (
		<View className='w-[198px] flex flex-col'>
			<View className='h-[154px] w-full bg-gray-50 flex items-center justify-center'>
				<Image
					src={imageUrl}
					className='h-full w-full object-contain'
				/>
			</View>

			<View
				onClick={onToggle}
				className='h-11 flex items-center justify-center bg-black cursor-pointer'>
				<Text className='text-white'>
					{isSelected ? t('buyTogether.added') : t('buyTogether.add')}
				</Text>
			</View>

			<Text className='mt-2 text-xs leading-4 min-h-[32px]'>{sku?.nameComplete || product?.productName}</Text>
			<Text className='mt-2 text-sm font-bold'>{formatAmount(price)}</Text>
			{installment && installment.NumberOfInstallments > 1 && (
				<Text className='text-[10px] text-gray-700'>
					{t('buyTogether.installment', {
						count: installment.NumberOfInstallments,
						value: formatAmount(installment.Value)
					})}
				</Text>
			)}
		</View>
	)
}
