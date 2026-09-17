import { Vtex } from 'eitri-shopping-vtex-shared'
import Eitri from 'eitri-bifrost'
import { fetchClientCode } from 'eitri-shopping-template-vtex-deco-shared'

export const getCart = async () => {
	return await Vtex.cart.getCartIfExists()
}

export const generateNewCart = async () => {
	return await Vtex.cart.generateNewCart()
}

export const addItem = async payload => {
	return await Vtex.cart.addItem(payload)
}

export const startPayment = async (cart, payload) => {
	return await Vtex.checkout.payV2(cart, payload)
}

export const getUserByEmail = async email => {
	return await Vtex.cart.getClientProfileByEmail(email)
}

export const saveCartIdOnStorage = async orderFormId => {
	return await Vtex.cart.saveCartIdOnStorage(orderFormId)
}

export const addUserData = async userData => {
	const newCart = await Vtex.checkout.addUserData(userData)
	return newCart
}

export const selectPaymentOption = async payload => {
	const newCart = await Vtex.checkout.selectPaymentOption(payload)
	return newCart
}

export const clearCart = async () => {
	await Vtex.cart.clearCart()
}

export const removeClientData = async () => {
	await Vtex.cart.removeClientData()
	return await getCart()
}

/**
 * Registra a identidade do cliente no addon do Salesforce. O `customerId`
 * daqui e o que o addon usa como contact key do Marketing Cloud (confirmado
 * com o time de plataforma da Eitri), por isso passamos o codigo de cliente
 * da loja — o mesmo usado na loja fisica e no e-commerce — e nao o id do
 * perfil VTEX, que quebrava a unificacao do tracking entre canais.
 *
 * `fetchClientCode` exige sessao autenticada: no checkout como convidado ele
 * nao devolve codigo e caimos no e-mail, o mesmo fallback do app de conta (ver
 * resolveContactKey), para que o mesmo cliente nao receba contact keys
 * diferentes dependendo de onde entrou. Aqui o `ok` da consulta e ignorado de
 * proposito: e um notify unico do checkout, sem retry nem persistencia, e ficar
 * sem identidade nenhuma no pedido e pior que cair no e-mail.
 */
export const registerToNotify = async userPayload => {
	try {
		const email = userPayload?.email || ''
		const { clientCode } = await fetchClientCode()
		const customerId = clientCode || email || userPayload?.customerId || ''
		Eitri.exposedApis.session.notifyLogin({ ...userPayload, customerId })
	} catch (e) {
		console.log('erro on registerToNotify', e)
	}
}

export const removeItemFromCart = async index => {
	return await Vtex.cart.removeItem(index)
}

export const cartHasCustomerData = cart => {
	return !!(
		cart.clientProfileData &&
		cart.clientProfileData.email &&
		cart.clientProfileData.firstName &&
		cart.clientProfileData.lastName &&
		cart.clientProfileData.document &&
		cart.clientProfileData.phone
	)
}

export const addLoggedCustomerToCart = async (loggedCustomer, cart, context) => {
	try {
		if (cart.clientProfileData) {
			await Vtex.cart.removeClientData()
		}

		const payload = {
			email: loggedCustomer.email,
			firstName: loggedCustomer.firstName,
			lastName: loggedCustomer.lastName,
			documentType: 'cpf',
			document: loggedCustomer.document,
			phone: loggedCustomer.homePhone,
			isCorporate: loggedCustomer.isCorporate,
			corporateName: loggedCustomer.corporateName,
			tradeName: loggedCustomer.tradeName,
			corporateDocument: loggedCustomer.corporateDocument,
			corporatePhone: loggedCustomer.corporatePhone,
			stateInscription: loggedCustomer.stateInscription
		}

		return await context.addPersonalData(payload)
	} catch (e) {
		console.log('erro on addLoggedCustomerToCart', e)
	}
}

export const getPixStatus = async (transactionId, paymentId) => {
	return await Vtex.checkout.getPixStatus(transactionId, paymentId)
}

export const updateOpenTextField = async (cart, receiver) => {
	let current = {}
	try {
		if (cart?.openTextField?.value) {
			current = JSON.parse(cart.openTextField.value)
		}
	} catch {
		current = {}
	}

	if (receiver) {
		current.receiver = receiver
	} else {
		delete current.receiver
	}

	return await Vtex.cart.addOpenTextFieldToCart(JSON.stringify(current))
}
