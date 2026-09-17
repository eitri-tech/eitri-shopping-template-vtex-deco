import { shippingResolver } from 'eitri-shopping-template-vtex-deco-shared'
import { Vtex } from 'eitri-shopping-vtex-shared'
import type { VtexSku } from '../types/vtex'

export default async function fetchFreight(zipCode: string, currentSku?: VtexSku) {
	if (!zipCode) {
		return
	}

	try {
		const address = await Vtex.checkout.resolveZipCode(zipCode)
		const { postalCode, country, geoCoordinates } = address

		let cartSimulationPayload
		let result

		const sellerDefault = currentSku?.sellers?.find(seller => seller.sellerDefault) || currentSku?.sellers?.[0]

		cartSimulationPayload = {
			items: [
				{
					id: currentSku?.itemId,
					quantity: '1',
					seller: sellerDefault?.sellerId
				}
			],
			country,
			postalCode,
			geoCoordinates
		}

		// simulateCart's second argument (salesChannel) is required by the SDK but was never
		// passed here — the simulation ran with an undefined sales channel instead of the
		// store's actual one, which can silently skew pricing/availability in the freight quote.
		result = await Vtex.cart.simulateCart(cartSimulationPayload, Vtex.configs?.salesChannel)

		const cannotBeDelivered = result?.messages?.find(item => item.code === 'cannotBeDelivered')

		if (cannotBeDelivered) {
			return []
		}

		// shippingResolver never reads shippingData.address (confirmed by grep) — the `true`
		// placeholder here was dead weight, dropped rather than fought into a VtexAddress shape.
		return shippingResolver({
			items: result?.items || [],
			shippingData: {
				logisticsInfo: result?.logisticsInfo ? result.logisticsInfo : result?.data?.shipping?.logisticsInfo,
				messages: result?.messages || ''
			}
		})
	} catch (error) {
		console.error('Error fetching freight', error)
	}
}
