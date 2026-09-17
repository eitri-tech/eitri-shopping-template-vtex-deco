import { Image, Text } from 'eitri-luminus'
import GroupsWrapper from './GroupsWrapper'
import { useLocalShoppingCart } from '../../../providers/LocalCart'
import { navigate } from '../../../services/navigationService'
import { TrackingService } from 'eitri-shopping-template-vtex-deco-shared'

export default function ExternalPayment(props) {
	const { cart } = useLocalShoppingCart()

	const { externalPaymentRc, onSelectPaymentMethod, systemGroup } = props

	const onSelectThisGroup = async () => {
		const paymentSystem = systemGroup?.paymentSystems?.[0]

		if (!paymentSystem) return
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
	}

	return (
		<GroupsWrapper
			title={externalPaymentRc.name}
			
			icon={
				<Image
					src={externalPaymentRc.imageUrl}
					className='w-[20px]'
				/>
			}
			
			onPress={onSelectThisGroup}>
			{externalPaymentRc.description && <Text fontSize='nano'>{externalPaymentRc.description}</Text>}
		</GroupsWrapper>
	)
}
