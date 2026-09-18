import { useEffect } from 'react'
import { Page, View } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import { clearCart, getCart } from '../services/cartService'
import { navigate } from '../services/navigationService'
import { TrackingService } from 'eitri-shopping-template-vtex-deco-shared'
import type { RouteProps } from '../types/route'

interface ExternalProviderPaymentResult {
	orderId?: string
	paymentAuthorizationAppCollection?: Array<{ appPayload?: string; [key: string]: unknown }>
	[key: string]: unknown
}

interface ExternalProviderOrderState {
	paymentResult?: ExternalProviderPaymentResult
}

export default function ExternalProviderOrder(props: RouteProps<ExternalProviderOrderState>) {
	let isMounted = true

	useEffect(() => {
		TrackingService.sendScreenView('Pagamento externo', 'ExternalProviderOrder')
	}, [])

	useEffect(() => {
		if (props.location?.state?.paymentResult) {
			const paymentResult = props.location?.state?.paymentResult

			const paymentAuthorizationApp = paymentResult.paymentAuthorizationAppCollection?.[0]
			const url = paymentAuthorizationApp?.appPayload

			if (url) {
				openProvider(url)
			}

			Eitri.navigation.setOnResumeListener(() => checkOrderStatus())
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.location?.state?.paymentResult])

	useEffect(() => {
		return () => {
			isMounted = false
		}
	}, [])

	const openProvider = async (url: string) => {
		Eitri.openBrowser({
			url: url,
			inApp: true
		})
	}

	async function checkOrderStatus() {
		try {
			if (!isMounted) return

			// Vtex.checkout.getCart doesn't exist — VtexCheckoutService has no such method; the real
			// cart-fetch entry point is this app's own getCart() wrapper (Vtex.cart.getCartIfExists).
			const cart = await getCart()

			if ((cart?.items?.length ?? 0) > 0) {
				navigate('ExternalProviderOrderFinished', {}, true)
			} else {
				clearCart()
				navigate('OrderCompleted', {
					orderValue: cart?.value,
					orderId: props.location?.state?.paymentResult?.orderId
				})
			}
		} catch (error) {
			// ignore — checked again on the next resume
		}
	}

	return (
		<Page title='Pagamento externo'>
			<View />
		</Page>
	)
}
