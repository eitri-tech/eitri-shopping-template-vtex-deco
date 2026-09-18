import { Vtex } from 'eitri-shopping-vtex-shared'
import type { VtexCart } from '../types/vtex'

export const getCart = async (): Promise<VtexCart> => {
	return await Vtex.cart.getCurrentOrCreateCart()
}

// Vtex.checkout.addItem doesn't exist — VtexCheckoutService has no such method. The real
// add-to-cart entry point is Vtex.cart.addItem; the original code would have thrown a
// TypeError on every call. (Same bug found and fixed identically in home/account/pdp.)
export const addItemToCart = async (payload: Record<string, unknown>): Promise<void> => {
	return await Vtex.cart.addItem(payload as any)
}

export const saveCartIdOnStorage = async (orderFormId: string) => {
	return await Vtex.cart.saveCartIdOnStorage(orderFormId)
}

export const addItemOffer = async (itemIndex: number, offeringId: string): Promise<VtexCart> => {
	return await Vtex.cart.addOfferingsItems(itemIndex, offeringId)
}

export const removeItemOffer = async (itemIndex: number, offeringId: string): Promise<VtexCart> => {
	return await Vtex.cart.removeOfferingsItems(itemIndex, offeringId)
}

export const changeItemQuantity = async (index: number, newQuantity: number): Promise<VtexCart> => {
	return await Vtex.cart.changeItemQuantity(index, newQuantity)
}

export const removeCartItem = async (index: number): Promise<VtexCart> => {
	return await Vtex.cart.removeItem(index)
}

export const addCoupon = async (coupon: string): Promise<VtexCart> => {
	return await Vtex.checkout.addPromoCode(coupon)
}

export const removeCoupon = async (): Promise<VtexCart> => {
	return await Vtex.checkout.addPromoCode('')
}

export const updateVendorInOpenTextField = async (
	cart: VtexCart | null | undefined,
	vendorText: string
): Promise<VtexCart> => {
	let current: Record<string, unknown> = {}
	try {
		if (cart?.openTextField?.value) {
			current = JSON.parse(cart.openTextField.value)
		}
	} catch {
		current = {}
	}
	if (vendorText) {
		current.vendor = vendorText
	} else {
		delete current.vendor
	}
	return await Vtex.cart.addOpenTextFieldToCart(JSON.stringify(current))
}
