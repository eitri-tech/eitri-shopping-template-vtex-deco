import { useEffect, useState } from 'react'
import { View } from 'eitri-luminus'
import { CustomButton, BottomInset, TrackingService } from 'eitri-shopping-template-vtex-deco-shared'
import { useLocalShoppingCart } from '../../providers/LocalCart'
import { useTranslation } from 'eitri-i18n'
import { useSnackBar } from '../../providers/SnackBar'
import type { VtexProduct, VtexSku } from '../../types/vtex'

interface ActionButtonProps {
	currentSku?: VtexSku
	product: VtexProduct
}

export default function ActionButton(props: ActionButtonProps) {
	const { addItem, cart, changeItemQuantity } = useLocalShoppingCart()
	const { showSnackBar } = useSnackBar()
	const { t } = useTranslation()
	const { currentSku, product } = props
	const [isAvailable, setIsAvailable] = useState(true)
	const [isLoading, setLoading] = useState(false)

	useEffect(() => {
		const mainSeller = currentSku?.sellers?.find(seller => seller.sellerDefault)
		// AvailableQuantity can be missing on a malformed offer — treat as unavailable rather
		// than letting the comparison silently coerce undefined > 0 to false in a confusing way.
		const isAvailable = (mainSeller?.commertialOffer?.AvailableQuantity ?? 0) > 0
		setIsAvailable(isAvailable)
	}, [currentSku])

	const addOrIncreaseCartItem = async () => {
		const itemIndexOnCart = cart?.items?.findIndex(item => item.id === currentSku?.itemId) ?? -1

		if (itemIndexOnCart > -1) {
			const currentCartQuantity = cart?.items?.[itemIndexOnCart]?.quantity || 0
			await changeItemQuantity(itemIndexOnCart, currentCartQuantity + 1)
		} else {
			await addItem({ ...currentSku, quantity: 1 })
		}

		TrackingService.addToCartEvent(product)
		showSnackBar('success', t('actionButton.snackAdded'))
	}

	const handleButtonClick = async () => {
		if (!isAvailable || isLoading) return

		setLoading(true)

		try {
			await addOrIncreaseCartItem()
		} finally {
			setLoading(false)
		}
	}

	return (
		<>
			<View className='fixed bottom-0 left-0 right-0 z-[999] bg-white rounded-t-2xl'>
				<View className='p-4 flex items-center  gap-2'>
					<CustomButton
						onClick={handleButtonClick}
						isLoading={isLoading}
						label={t('actionButton.labelBuy')}
						disabled={!isAvailable}
					/>
				</View>

				<BottomInset />
			</View>
			<View>
				<View className='h-[77px] w-full' />
			</View>
		</>
	)
}
