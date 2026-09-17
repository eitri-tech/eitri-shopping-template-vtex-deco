import { formatAmountInCents } from './utils'
import type { VtexCart, VtexPaymentSystem } from '../types/vtex'

interface ResolvedInstallment {
	count?: number
	value?: number
	hasInterestRate?: boolean
	label: string
	formattedValue: string
	[key: string]: unknown
}

interface ResolvedPaymentSystem extends VtexPaymentSystem {
	isCurrentPaymentSystem?: boolean
	installments?: ResolvedInstallment[]
}

interface PaymentSystemGroup {
	groupName?: string
	isCurrentPaymentSystemGroup?: boolean
	paymentSystems: ResolvedPaymentSystem[]
}

export const paymentSystemResolver = (cart: VtexCart): PaymentSystemGroup[] | undefined => {
	const paymentData = JSON.parse(JSON.stringify(cart.paymentData)) as VtexCart['paymentData']

	return paymentData?.paymentSystems?.reduce<PaymentSystemGroup[]>((acc, paymentSystem) => {
		const group = acc?.find(group => group.groupName === paymentSystem.groupName)

		const installments = paymentData.installmentOptions?.find(
			installment => installment.paymentSystem === paymentSystem.stringId
		)

		const isCurrentPaymentSystem = paymentData?.payments?.some(
			payment => payment.paymentSystem === paymentSystem.stringId
		)

		if (group) {
			group.isCurrentPaymentSystemGroup = isCurrentPaymentSystem
			group.paymentSystems.push({
				...paymentSystem,
				isCurrentPaymentSystem: isCurrentPaymentSystem,
				installments: (installments?.installments ?? []).map(installment => ({
					...installment,
					label: `${installment.count}x de ${formatAmountInCents(installment.value)} ${installment.hasInterestRate ? 'com juros' : 'sem juros'}`,
					formattedValue: formatAmountInCents(installment.value)
				}))
			})
		} else {
			acc.push({
				groupName: paymentSystem.groupName,
				isCurrentPaymentSystemGroup: isCurrentPaymentSystem,
				paymentSystems: [
					{
						...paymentSystem,
						isCurrentPaymentSystem: isCurrentPaymentSystem,
						installments: (installments?.installments ?? []).map(installment => ({
							...installment,
							label: `${installment.count}x de ${formatAmountInCents(installment.value)} ${installment.hasInterestRate ? 'com juros' : 'sem juros'}`,
							formattedValue: formatAmountInCents(installment.value)
						}))
					}
				]
			})
		}

		return acc
	}, [])
}
