import { Vtex } from 'eitri-shopping-vtex-shared'
import type { VtexAddress } from '../types/vtex'

export const getAddresses = async (): Promise<VtexAddress[]> => {
	const result = await Vtex.customer.getAddresses()
	return result?.data?.profile?.addresses || []
}

export async function createAddress(payload: Partial<VtexAddress>) {
	return await Vtex.customer.createAddress(payload)
}

export async function updateAddress(addressId: string, payload: Partial<VtexAddress>) {
	return await Vtex.customer.updateAddress(addressId, payload)
}

export async function deleteAddress(addressId: string) {
	return await Vtex.customer.deleteAddress(addressId)
}

export const resolvePostalCode = async (postalCode: string) => {
	return await Vtex.cart.resolvePostalCode(postalCode)
}
