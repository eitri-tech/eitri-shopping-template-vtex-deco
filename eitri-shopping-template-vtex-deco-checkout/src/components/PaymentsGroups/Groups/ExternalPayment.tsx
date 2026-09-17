import { Image, Text } from 'eitri-luminus'
import GroupsWrapper from './GroupsWrapper'
import { useLocalShoppingCart } from '../../../providers/LocalCart'
import { navigate } from '../../../services/navigationService'
import { TrackingService } from 'eitri-shopping-template-vtex-deco-shared'
import type { PaymentGroupProps } from '../../../types/payment'
import type { CheckoutExternalPayment } from '../../../types/vtex'

interface ExternalPaymentProps extends PaymentGroupProps {
	externalPaymentRc?: CheckoutExternalPayment
}

export default function ExternalPayment(props: ExternalPaymentProps) {
	const { cart } = useLocalShoppingCart()

	const { externalPaymentRc, onSelectPaymentMethod, systemGroup } = props

	const onSelectThisGroup = async () => {
		const paymentSystem = systemGroup?.paymentSystems?.[0]

		if (!paymentSystem || !cart || typeof onSelectPaymentMethod !== 'function') return
		try {
			await onSelectPaymentMethod([
				{
					paymentSystem: paymentSystem.id,
					installmentsInterestRate: 0,
					installments: 1,
					referenceValue: cart.value,
					value: cart.value,
					hasDefaultBillingAddress: true
				}
			])
			TrackingService.addPaymentInfoEvent(cart, paymentSystem.name)
			navigate('CheckoutReview')
		} catch (e) {
			console.error('ExternalPayment: select failed', e)
		}
	}

	return (
		<GroupsWrapper
			title={externalPaymentRc?.name ?? ''}
			icon={
				externalPaymentRc?.imageUrl ? (
					<Image
						src={externalPaymentRc.imageUrl}
						className='w-[20px]'
					/>
				) : null
			}
			onPress={onSelectThisGroup}>
			{/* Text has no `fontSize` prop in Luminus — the legacy `fontSize='nano'` was a no-op; text-xs is the intent. */}
			{externalPaymentRc?.description && <Text className='text-xs'>{externalPaymentRc.description}</Text>}
		</GroupsWrapper>
	)
}
