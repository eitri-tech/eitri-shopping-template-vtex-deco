import { Vtex } from 'eitri-shopping-vtex-shared'

export default async function loadGPaymentData(): Promise<unknown> {
	return await Vtex.googlePay.loadPaymentData()
}
