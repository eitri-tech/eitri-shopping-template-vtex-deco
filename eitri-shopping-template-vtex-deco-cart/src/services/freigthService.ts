import { Vtex } from 'eitri-shopping-vtex-shared'
import type { VtexAddress, VtexCart, VtexLogisticsInfo, VtexSla } from '../types/vtex'

export const setLogisticInfo = async (payload: unknown) => {
	try {
		const newCart = await Vtex.checkout.setLogisticInfo(payload)

		return newCart
	} catch (error) {
		console.error('setLogisticInfo', error)
	}
}

export const setNewAddress = async (cart: VtexCart, zipCode: string) => {
	try {
		const address = await Vtex.checkout.resolveZipCode(zipCode)

		const selectedAddresses = generateSelectedAddressesPayload(cart?.shippingData?.selectedAddresses, address)
		return await Vtex.checkout.setLogisticInfo({
			logisticsInfo: cart?.shippingData?.logisticsInfo,
			clearAddressIfPostalCodeNotFound: false,
			selectedAddresses: selectedAddresses
		})
	} catch (error) {
		console.error('getZipCode Error', error)
	}
}

const generateLogisticInfoPayload = (addressId: string, shippingOptions?: VtexSla[]) => {
	return shippingOptions?.map(option => {
		return {
			addressId,
			itemIndex: option.itemIndex,
			selectedDeliveryChannel: option.deliveryChannel,
			selectedSla: option.id
		}
	})
}

const generateSelectedAddressesPayload = (
	selectedAddresses: VtexAddress[] | undefined,
	address: VtexAddress
): VtexAddress[] => {
	const { street, neighborhood, city, state, country, geoCoordinates, postalCode } = address

	if (selectedAddresses && selectedAddresses.length > 0) {
		return selectedAddresses.map(selectedAd => {
			return {
				addressType: selectedAd.addressType,
				receiverName: selectedAd.receiverName,
				addressId: selectedAd.addressId,
				isDisposable: true,
				postalCode: postalCode,
				city: selectedAd.city,
				state: selectedAd.state,
				country,
				street,
				number: null,
				neighborhood,
				complement: null,
				reference: null,
				geoCoordinates,
				addressQuery: selectedAd.addressQuery
			}
		})
	}

	return [
		{
			addressType: 'search',
			receiverName: '',
			isDisposable: true,
			postalCode: postalCode,
			city: city,
			state: state,
			country: country,
			street: street,
			number: null,
			neighborhood: neighborhood,
			complement: null,
			reference: null,
			geoCoordinates: geoCoordinates?.map(coord => coord),
			addressQuery: ''
		},
		{
			addressType: 'residential',
			receiverName: '',
			isDisposable: true,
			postalCode: postalCode,
			city: city,
			state: state,
			country: country,
			street: street,
			number: null,
			neighborhood: neighborhood,
			complement: null,
			reference: null,
			geoCoordinates: geoCoordinates?.map(coord => coord),
			addressQuery: ''
		}
	]
}

export const simulateCart = async (zipCode: string, cart: VtexCart) => {
	if (!zipCode) {
		return
	}

	try {
		const address = await Vtex.checkout.resolveZipCode(zipCode)

		const { postalCode, city, state, street, neighborhood, country, geoCoordinates } = address

		const cartSimulationPayload = {
			items: cart?.items?.map(item => {
				return {
					id: item.id,
					quantity: item.quantity,
					seller: item.seller
				}
			}),
			country,
			postalCode,
			geoCoordinates
		}

		// simulateCart requires a salesChannel second argument per its real signature; this
		// function isn't currently called anywhere in the app, so no live value was available to
		// pass — left undefined rather than fabricating a channel id.
		return await Vtex.cart.simulateCart(cartSimulationPayload, undefined)
	} catch (error) {
		console.error('Error fetching freight', error)
	}
}

export const resolveZipCode = async (zipCode: string) => {
	return await Vtex.checkout.resolveZipCode(zipCode)
}

export default async function fetchFreight(zipCode: string, currentSku: unknown) {
	if (!zipCode) {
		return
	}

	try {
		const { street, neighborhood, city, state, country, geoCoordinates } =
			await Vtex.checkout.resolveZipCode(zipCode)
		const address = {
			street,
			neighborhood,
			city,
			state,
			country,
			geoCoordinates
		}

		const payload = {
			address,
			clearAddressIfPostalCodeNotFound: true
		}
		console.log('payload', payload)
		const newCart = await Vtex.checkout.setLogisticInfo(payload)
	} catch (error) {
		console.error('Error fetching freight', error)
	}
}
