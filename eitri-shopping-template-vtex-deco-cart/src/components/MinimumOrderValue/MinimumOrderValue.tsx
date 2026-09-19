import { View, Text } from 'eitri-luminus'
import { GenericBox } from 'eitri-shopping-template-vtex-deco-shared'
import { useTranslation } from 'eitri-i18n'
import { useLocalShoppingCart } from '../../providers/LocalCart'
import { formatAmountInCents } from '../../utils/utils'
import { getMinimumOrderStatus } from '../../utils/minimumOrderValue'

interface MinimumOrderValueProps {
	fallbackMinimumValueInCents?: number
}

export default function MinimumOrderValue(props: MinimumOrderValueProps) {
	const { fallbackMinimumValueInCents = 0 } = props
	const { cart } = useLocalShoppingCart()
	const { t } = useTranslation()

	if (!cart) return null

	const { minimumValueInCents, missingValueInCents, progress, hasReachedMinimumOrderValue } = getMinimumOrderStatus(
		cart,
		fallbackMinimumValueInCents
	)

	if (minimumValueInCents <= 0 || hasReachedMinimumOrderValue) return null

	return (
		<View className='px-4'>
			<GenericBox className='p-4'>
				<Text className='text-sm font-semibold text-base-content mb-3'>
					{hasReachedMinimumOrderValue
						? t('minimumOrderValue.reached')
						: t('minimumOrderValue.missing', { value: formatAmountInCents(missingValueInCents) })}
				</Text>

				<View className='w-full h-2 rounded-full bg-base-200 overflow-hidden mt-2'>
					<View
						className='h-full rounded-full bg-primary'
						style={{ width: `${progress}%` }}
					/>
				</View>
			</GenericBox>
		</View>
	)
}
