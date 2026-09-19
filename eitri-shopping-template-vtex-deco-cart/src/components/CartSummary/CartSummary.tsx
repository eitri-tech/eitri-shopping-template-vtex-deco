import { useEffect, useState } from 'react'
import { View, Text } from 'eitri-luminus'
import { GenericBox } from 'eitri-shopping-template-vtex-deco-shared'
import { useTranslation } from 'eitri-i18n'
import { formatAmountInCents } from '../../utils/utils'
import { useLocalShoppingCart } from '../../providers/LocalCart'
import type { VtexTotalizer } from '../../types/vtex'

export default function CartSummary() {
	const { cart } = useLocalShoppingCart()

	const [itemsValue, setItemsValue] = useState(0)
	const [discounts, setDiscounts] = useState(0)
	const [total, setTotal] = useState(0)

	const { t } = useTranslation()

	useEffect(() => {
		if (!cart) return
		const items = getTotalizerById(cart.totalizers, 'Items')
		const discounts = getTotalizerById(cart.totalizers, 'Discounts')

		setItemsValue(items?.value || 0)
		setDiscounts(discounts?.value || 0)

		const total = (items?.value ?? 0) + (discounts?.value ?? 0)
		setTotal(total)
	}, [cart])

	// cart.totalizers can be missing entirely — without the fallback this throws on any
	// order form where VTEX hasn't populated totalizers yet.
	const getTotalizerById = (totalizers: VtexTotalizer[] | undefined, id: string) =>
		(totalizers ?? []).find(item => item.id === id)

	if (total === 0) return null

	return (
		<View className='px-4'>
			<GenericBox className='p-4'>
				<View className='w-full flex justify-center'>
					<View className='w-full max-w-sm px-4'>
						{itemsValue > 0 && (
							<View className='flex justify-between py-2'>
								<Text className='text-base-content/70 text-sm'>{t('cartSummary.txtSubtotal')}</Text>
								<Text className='text-sm'>{formatAmountInCents(itemsValue)}</Text>
							</View>
						)}
						{discounts !== 0 && (
							<View className='flex justify-between py-2'>
								<Text className='text-base-content/70 text-sm'>{t('cartSummary.txtDiscount')}</Text>
								<Text className='text-sm'>{formatAmountInCents(discounts)}</Text>
							</View>
						)}
						{/*{shipping && (*/}
						{/*	<View className='flex justify-between py-2'>*/}
						{/*		<Text className='text-base-content/70 text-sm'>{t('cartSummary.txtDelivery')}</Text>*/}
						{/*		<Text className='text-sm'>{formatAmountInCents(shipping.value)}</Text>*/}
						{/*	</View>*/}
						{/*)}*/}
						{total > 0 && (
							<View className='flex justify-between py-2 border-t border-base-300 mt-2 pt-2'>
								<Text className='text-base-content font-bold text-base'>
									{t('cartSummary.txtTotal')}
								</Text>
								<Text className='text-base font-bold text-primary'>{formatAmountInCents(total)}</Text>
							</View>
						)}
					</View>
				</View>
			</GenericBox>
		</View>
	)
}
