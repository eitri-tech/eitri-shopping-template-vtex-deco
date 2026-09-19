import { useLocalShoppingCart } from '../../../providers/LocalCart'
import Boleto from '../../Icons/MethodIcons/Boleto'
import GroupsWrapper from './GroupsWrapper'
import type { PaymentGroupProps } from '../../../types/payment'
import type { ResolvedPaymentSystem } from '../../../utils/getPaymentSystem'

interface BankInvoiceProps extends PaymentGroupProps {
	// Legacy prop name — ImplementationInterface only ever passed `systemGroup`, so reading
	// `paymentSystems[0]` directly (the JS version) threw on every render. Both are accepted now.
	paymentSystems?: ResolvedPaymentSystem[]
}

export default function BankInvoice(props: BankInvoiceProps) {
	const { setSelectedPaymentData } = useLocalShoppingCart()
	const { paymentSystems, systemGroup, groupName } = props

	const onSelectThisGroup = () => {
		const system = paymentSystems?.[0] ?? systemGroup?.paymentSystems?.[0]
		if (!system) return
		const firstInstallment = system.installments?.[0]

		setSelectedPaymentData?.({
			groupName,
			paymentSystem: system,
			payload: {
				paymentSystem: system.stringId,
				bin: system.bin ?? null,
				hasDefaultBillingAddress: true,
				isLuhnValid: true,
				installmentsInterestRate: firstInstallment?.interestRate,
				accountId: null,
				tokenId: null,
				installments: `${firstInstallment?.count ?? ''}`, //TODO: NÃO ESTÁ RECEBENDO COMO NUMERO
				referenceValue: firstInstallment?.value,
				value: firstInstallment?.total,
				isRegexValid: true
			},
			isReadyToPay: true
		})
	}

	return (
		<GroupsWrapper
			title='Boleto Bancário'
			icon={<Boleto />}
			onPress={onSelectThisGroup}
		/>
	)
}
