import { formatAmountInCents } from './utils'
import type { VtexCart, VtexPaymentSystem } from '../types/vtex'

export interface ResolvedInstallment {
	count?: number
	interestRate?: number
	value?: number
	total?: number
	label: string
	formattedValue: string
	[key: string]: unknown
}

export interface ResolvedPaymentSystem extends VtexPaymentSystem {
	bin?: string | null
	isCurrentPaymentSystem?: boolean
	installments?: ResolvedInstallment[]
}

export interface PaymentSystemGroup {
	groupName?: string
	isCurrentPaymentSystemGroup?: boolean
	paymentSystems: ResolvedPaymentSystem[]
}

export const getPaymentSystem = (cart: VtexCart): PaymentSystemGroup[] | undefined => {
	if (!cart?.paymentData) return
	const paymentData = JSON.parse(JSON.stringify(cart?.paymentData)) as VtexCart['paymentData']

	return paymentData?.paymentSystems?.reduce<PaymentSystemGroup[]>((acc, paymentSystem) => {
		const group = acc?.find(group => group.groupName === paymentSystem.groupName)

		const installments = paymentData.installmentOptions?.find(
			installment => installment.paymentSystem === paymentSystem.stringId
		)

		const currentPaymentSystem = paymentData?.payments?.some(
			payment => payment.paymentSystem === paymentSystem.stringId
		)

		const paymentSystemObject: ResolvedPaymentSystem = {
			...paymentSystem,
			isCurrentPaymentSystem: currentPaymentSystem,
			installments: (installments?.installments ?? []).map(installment => ({
				...installment,
				label: `${installment.count}x de ${formatAmountInCents(
					installment.value
				)} (total: ${formatAmountInCents(installment.total)})`,
				formattedValue: formatAmountInCents(installment.value)
			}))
		}

		if (group) {
			group.isCurrentPaymentSystemGroup =
				paymentSystemObject.isCurrentPaymentSystem ||
				group.paymentSystems.some(ps => ps.isCurrentPaymentSystem)
			group.paymentSystems.push({
				...paymentSystemObject
			})
		} else {
			acc.push({
				isCurrentPaymentSystemGroup: paymentSystemObject.isCurrentPaymentSystem,
				groupName: paymentSystem.groupName,
				paymentSystems: [
					{
						...paymentSystemObject
					}
				]
			})
		}

		return acc
	}, [])
}
