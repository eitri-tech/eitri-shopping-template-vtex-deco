import { formatAmountInCents } from '../../utils/utils'
import { useLocalShoppingCart } from '../../providers/LocalCart'
import { useTranslation } from 'eitri-i18n'
import { Text, View } from 'eitri-luminus'
import { GenericBox } from 'eitri-shopping-template-vtex-deco-shared'

export default function CartSummary() {
	const { t } = useTranslation()
	const { cart } = useLocalShoppingCart()

	const totalizers = Array.isArray(cart?.totalizers) ? cart.totalizers : []
	const finalTotal = totalizers.reduce((acc, totalizer) => acc + (totalizer?.value ?? 0), 0)

	return (
		<GenericBox className='p-4 w-full flex flex-col'>
			{/* Totalizers breakdown */}
			<View className='flex flex-col gap-1 pb-2'>
				{totalizers.map((totalizer, index) => (
					<View
						key={totalizer?.id ?? index}
						className='flex flex-row justify-between items-center'>
						<Text className='text-neutral-600 text-sm'>{totalizer?.name ?? ''}</Text>
						<Text className='text-neutral-700 font-medium'>{formatAmountInCents(totalizer?.value)}</Text>
					</View>
				))}
			</View>

			{/* Final total */}
			<View className='flex flex-row w-full justify-between items-center pt-3 border-t border-neutral-300'>
				<Text className='text-neutral-700 font-bold'>{t('finishCart.txtTotal')}</Text>
				<Text className='font-bold text-primary-700'>{formatAmountInCents(finalTotal)}</Text>
			</View>
		</GenericBox>
	)
}
