import type { ComponentType } from 'react'
import { App } from 'eitri-shopping-vtex-shared'
import CreditCard from './Groups/CreditCard'
import BankInvoice from './Groups/BankInvoice'
import InstantPayment from './Groups/InstantPayment'
import GiftCard from './Groups/GiftCard'
import GooglePay from './Groups/GooglePay'
import StoreCard from './Groups/StoreCard'
import ExternalPayment from './Groups/ExternalPayment'
import type { PaymentGroupProps } from '../../types/payment'
import type { CheckoutExternalPayment } from '../../types/vtex'

const PAYMENT_GROUPS_IMPLEMENTATION: Record<string, ComponentType<PaymentGroupProps>> = {
	creditCardPaymentGroup: CreditCard,
	bankInvoicePaymentGroup: BankInvoice,
	instantPaymentPaymentGroup: InstantPayment,
	giftCardPaymentGroup: GiftCard,
	'WH Google PayPaymentGroup': GooglePay,
	customPrivate_501PaymentGroup: StoreCard
}

export default function ImplementationInterface(props: PaymentGroupProps) {
	const { groupName, systemGroup, onSelectPaymentMethod } = props

	// eitri-shopping-vtex-shared's own .d.ts only declares { verbose, gaVerbose } for App.configs,
	// tighter than its real runtime shape (which carries the merged appConfigs too).
	const configs = App?.configs as { appConfigs?: { externalPayments?: CheckoutExternalPayment[] } } | undefined
	const externalPaymentsImplementation = configs?.appConfigs?.externalPayments ?? []

	const externalPaymentRc = externalPaymentsImplementation.find(
		externalPayment => externalPayment?.externalGroupName === groupName
	)

	if (externalPaymentRc) {
		return (
			<ExternalPayment
				systemGroup={systemGroup}
				groupName={groupName}
				externalPaymentRc={externalPaymentRc}
				onSelectPaymentMethod={onSelectPaymentMethod}
			/>
		)
	}

	const Implementation = groupName ? PAYMENT_GROUPS_IMPLEMENTATION[groupName] : undefined
	if (!Implementation) {
		return null
	}

	return (
		<Implementation
			groupName={groupName}
			systemGroup={systemGroup}
			onSelectPaymentMethod={onSelectPaymentMethod}
		/>
	)
}
