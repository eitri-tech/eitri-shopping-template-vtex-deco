import { Vtex } from 'eitri-shopping-vtex-shared'

export const getAddresses = async () => {
	const result = await Vtex.customer.getAddresses()
	return result?.data?.profile?.addresses || []
}

export async function createAddress (payload) {
	return await Vtex.customer.createAddress(payload)
}

export async function updateAddress (addressId, payload) {
	return await Vtex.customer.updateAddress(addressId, payload)
}

export async function deleteAddress (addressId) {
	return await Vtex.customer.deleteAddress(addressId)
}

export const resolvePostalCode = async postalCode => {
	return await Vtex.cart.resolvePostalCode(postalCode)
}