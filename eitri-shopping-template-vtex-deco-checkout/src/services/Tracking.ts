import { TrackingService } from 'eitri-shopping-template-vtex-deco-shared'
import { autoTriggerGAEvents } from './AppService'

export const trackShippingInfo = async cart => {
	try {
		const totalizer = cart?.totalizers?.find(i => i.id === 'Items')
		const value = totalizer?.value ? totalizer.value / 100 : cart.value ? cart.value / 100 : ''
		const shippingTier = cart?.shippingData?.logisticsInfo.find(i => i.selectedSla)

		// evento enviado automaticamente pelo Vtex service se autoTriggerGAEvents() for true
		if (!autoTriggerGAEvents()) {
			const items = cart.items.map(item => {
				return {
					item_id: `${item.productId}_${item.id}`,
					item_name: item.name,
					item_brand: item.additionalInfo?.brandName,
					price: item.sellingPrice / 100,
					quantity: item.quantity
				}
			})
			TrackingService.event('add_shipping_info', {
				currency: 'BRL',
				shipping_tier: shippingTier?.selectedSla ? shippingTier.selectedSla : '',
				value: value,
				coupon: cart.marketingData?.coupon || '',
				items: items
			})
		}

		TrackingService.inngageEvent('add_shipping_info', {
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
