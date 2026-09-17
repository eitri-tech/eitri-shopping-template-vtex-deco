import { Vtex } from 'eitri-shopping-vtex-shared'

export default async function setFreight(payload) {
	const newCart = await Vtex.checkout.setLogisticInfo(payload)
	return newCart
}

export const setLogisticInfo = async payload => {
	const newCart = await Vtex.checkout.setLogisticInfo(payload)
	return newCart
}

export const setNewAddress = async address => {
	try {
		return await Vtex.checkout.setLogisticInfo({
			clearAddressIfPostalCodeNotFound: false,
			selectedAddresses: Array.isArray(address) ? address : [address]
		})
	} catch (error) {
		console.error('getZipCode Error', error)
	}
}

export const setShippingAddress = async address => {
	const newCart = await Vtex.checkout.setLogisticInfo({
		clearAddressIfPostalCodeNotFound: false,
		address
	})
	return newCart
}

export const resolvePostalCode = async postalCode => {
	return await Vtex.cart.resolvePostalCode(postalCode)
}
