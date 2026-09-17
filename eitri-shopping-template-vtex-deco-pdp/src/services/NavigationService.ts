import Eitri from 'eitri-bifrost'
import type { VtexCart, VtexProduct } from '../types/vtex'

export const openCart = async (cart?: VtexCart): Promise<void> => {
	try {
		Eitri.nativeNavigation.open({
			slug: 'cart',
			initParams: { orderFormId: cart?.orderFormId }
		})
	} catch (e) {
		console.error('navigate to cart: Error trying to open cart', e)
	}
}

export const openProduct = async (product: VtexProduct): Promise<void> => {
	try {
		Eitri.nativeNavigation.open({
			slug: 'pdp',
			initParams: { product: product }
		})
	} catch (e) {
		console.error('navigate to cart: Error trying to open cart', e)
	}
}
