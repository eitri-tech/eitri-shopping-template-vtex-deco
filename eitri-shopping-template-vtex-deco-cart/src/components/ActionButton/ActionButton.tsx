import { View } from 'eitri-luminus'
import { CustomButton, BottomInset, useBottomBarVisibility } from 'eitri-shopping-template-vtex-deco-shared'
import { useTranslation } from 'eitri-i18n'
import { useLocalShoppingCart } from '../../providers/LocalCart'
import { navigateToCheckout } from '../../services/navigationService'
import { hasReachedMinimumOrderValue } from '../../utils/minimumOrderValue'

export default function ActionButton() {
	const { cart } = useLocalShoppingCart()
	const { t } = useTranslation()
	const bottomBarVisible = useBottomBarVisibility()

	const goToCheckout = async () => {
		if (isValidToProceed()) {
			navigateToCheckout(cart?.orderFormId)
		}
	}

	const isValidToProceed = (): boolean => {
		if (!cart) return false
		if (!cart?.items) return false
		if (cart?.items.length === 0) return false
		if (cart?.items?.some(item => item.availability !== 'available')) return false
		return hasReachedMinimumOrderValue(cart)
	}

	return (
		<>
			<View className={`fixed bottom-0 left-0 w-full z-50 bg-white border-t border-gray-300 transition-transform duration-300 ${bottomBarVisible ? 'translate-y-0' : 'translate-y-1/2'}`}>
				<View className='p-4'>
					<CustomButton
						disabled={!isValidToProceed()}
						label={t('cartSummary.labelFinish')}
						onPress={goToCheckout}
					/>
				</View>
				<BottomInset />
			</View>

			<View className='h-[77px]' />

			<BottomInset />
		</>
	)
}
