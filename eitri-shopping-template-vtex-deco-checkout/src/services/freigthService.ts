import { Vtex } from 'eitri-shopping-vtex-shared'
import type { VtexAddress, VtexCart, VtexResolvedPostalCode } from '../types/vtex'

export default async function setFreight(payload: unknown): Promise<VtexCart> {
	const newCart = await Vtex.checkout.setLogisticInfo(payload)
	return newCart
}

export const setLogisticInfo = async (payload: unknown): Promise<VtexCart> => {
	const newCart = await Vtex.checkout.setLogisticInfo(payload)
	return newCart
}

export const setNewAddress = async (address: VtexAddress | VtexAddress[]): Promise<VtexCart | undefined> => {
	try {
		return await Vtex.checkout.setLogisticInfo({
			clearAddressIfPostalCodeNotFound: false,
			selectedAddresses: Array.isArray(address) ? address : [address]
		})
	} catch (error) {
		console.error('getZipCode Error', error)
	}
}

export const setShippingAddress = async (address: VtexAddress): Promise<VtexCart> => {
	const newCart = await Vtex.checkout.setLogisticInfo({
		clearAddressIfPostalCodeNotFound: false,
		address
	})
	return newCart
}

export const resolvePostalCode = async (postalCode: string): Promise<VtexResolvedPostalCode> => {
	return await Vtex.cart.resolvePostalCode(postalCode)
}
