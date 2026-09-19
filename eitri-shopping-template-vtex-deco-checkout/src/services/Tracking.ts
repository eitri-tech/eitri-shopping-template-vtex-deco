import { TrackingService } from 'eitri-shopping-template-vtex-deco-shared'
import { autoTriggerGAEvents } from './AppService'
import type { VtexCart } from '../types/vtex'

// BUG (not a type issue): shared's TrackingService was refactored to a GA4-specific API
// (addShippingInfoEvent, addToCartEvent, ...) and no longer has generic `.event()` /
// `.inngageEvent()` methods — those only ever existed on TrackingService_old, which isn't
// re-exported from the shared package. This file was never updated after that refactor, so both
// calls below throw at runtime; the surrounding try/catch swallows it silently, meaning
// `add_shipping_info` tracking has never actually fired from checkout. Casting through `any`
// here only to keep the migration behavior-preserving — this needs a product decision (wire to
// `TrackingService.addShippingInfoEvent(cart)` for GA, and decide whether the Inngage event has
// any equivalent today), not a silent fix inside a TS migration.
const TrackingServiceLegacyAny = TrackingService as unknown as {
	event: (eventName: string, data: Record<string, unknown>) => void
	inngageEvent: (eventName: string, data: Record<string, unknown>) => void
}

export const trackShippingInfo = async (cart: VtexCart): Promise<void> => {
	try {
		const totalizer = cart?.totalizers?.find(i => i.id === 'Items')
		const value = totalizer?.value ? totalizer.value / 100 : cart.value ? cart.value / 100 : ''
		const shippingTier = cart?.shippingData?.logisticsInfo?.find(i => i.selectedSla)

		// evento enviado automaticamente pelo Vtex service se autoTriggerGAEvents() for true
		if (!autoTriggerGAEvents()) {
			const items = cart.items.map(item => {
				return {
					item_id: `${item.productId}_${item.id}`,
					item_name: item.name,
					item_brand: item.additionalInfo?.brandName,
					price: (item.sellingPrice ?? 0) / 100,
					quantity: item.quantity
				}
			})
			TrackingServiceLegacyAny.event('add_shipping_info', {
				currency: 'BRL',
				shipping_tier: shippingTier?.selectedSla ? shippingTier.selectedSla : '',
				value: value,
				coupon: cart.marketingData?.coupon || '',
				items: items
			})
		}

		TrackingServiceLegacyAny.inngageEvent('add_shipping_info', {
			currency: 'BRL',
			shipping_tier: shippingTier?.selectedSla ? shippingTier.selectedSla : '',
			value: value,
			coupon: cart.marketingData?.coupon || '',
			items: cart.items
				.map(item => `${item.productId}-${item.name || item.productName || item.nameComplete}`)
				.join(';')
		})
	} catch (e) {
		console.log('Error on trackShippingInfo', e)
	}
}
