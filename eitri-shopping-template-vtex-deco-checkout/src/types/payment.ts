import type { PaymentSystemGroup } from '../utils/getPaymentSystem'
import type { OnSelectPaymentMethod } from './vtex'

/** Props every payment-group implementation receives from ImplementationInterface. */
export interface PaymentGroupProps {
	groupName?: string
	systemGroup?: PaymentSystemGroup
	onSelectPaymentMethod?: OnSelectPaymentMethod
}
