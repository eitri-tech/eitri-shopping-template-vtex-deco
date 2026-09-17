import { useLocalShoppingCart } from '../../../providers/LocalCart'
import Boleto from '../../Icons/MethodIcons/Boleto'
import GroupsWrapper from './GroupsWrapper'

export default function BankInvoice(props) {
	const { selectedPaymentData, setSelectedPaymentData } = useLocalShoppingCart()
	const { paymentSystems, groupName } = props

	const onSelectThisGroup = () => {
		setSelectedPaymentData({
			groupName: groupName,
			paymentSystem: paymentSystems[0],
			payload: {
				paymentSystem: paymentSystems[0].stringId,
				bin: paymentSystems[0].bin,
				hasDefaultBillingAddress: true,
				isLuhnValid: true,
				installmentsInterestRate: paymentSystems[0].installments[0]?.interestRate,
				accountId: null,
				tokenId: null,
				installments: `${paymentSystems[0].installments[0]?.count}`, //TODO: NÃO ESTÁ RECEBENDO COMO NUMERO
				referenceValue: paymentSystems[0].installments[0]?.value,
				value: paymentSystems[0].installments[0]?.total,
				isRegexValid: true
			},
			isReadyToPay: true
		})
	}

	return (
		<GroupsWrapper
			title='Boleto Bancário'
			icon={<Boleto />}
			isChecked={groupName === selectedPaymentData?.groupName}
			onPress={onSelectThisGroup}
		/>
	)
}
