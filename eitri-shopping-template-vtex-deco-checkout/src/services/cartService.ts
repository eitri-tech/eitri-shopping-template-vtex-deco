import { Vtex } from 'eitri-shopping-vtex-shared'
import Eitri from 'eitri-bifrost'
import type { VtexCart } from '../types/vtex'

export const getCart = async (): Promise<VtexCart> => {
	return await Vtex.cart.getCartIfExists()
}

export const generateNewCart = async (): Promise<VtexCart> => {
	return await Vtex.cart.generateNewCart()
}

interface AddItemPayload {
	id?: string
	item: unknown
	itemId?: string
	salesChannel: string
	quantity: number
	seller: string
	sellers?: unknown[]
}

// Vtex.cart.addItem resolves to Promise<void> per its real signature — it does not hand back
// the updated cart, unlike most other cart mutations here. (This wrapper is currently unused;
// Cartman.jsx calls Vtex.cart.addItem directly instead.)
export const addItem = async (payload: AddItemPayload): Promise<void> => {
	return await Vtex.cart.addItem(payload)
}

export const startPayment = async (cart: VtexCart, payload: unknown): Promise<unknown> => {
	return await Vtex.checkout.payV2(cart, payload)
}

export const getUserByEmail = async (email: string): Promise<unknown> => {
	return await Vtex.cart.getClientProfileByEmail(email)
}

export const saveCartIdOnStorage = async (orderFormId: string): Promise<unknown> => {
	return await Vtex.cart.saveCartIdOnStorage(orderFormId)
}

export const addUserData = async (userData: unknown): Promise<VtexCart> => {
	const newCart = await Vtex.checkout.addUserData(userData)
	return newCart
}

export const selectPaymentOption = async (payload: unknown): Promise<VtexCart> => {
	const newCart = await Vtex.checkout.selectPaymentOption(payload)
	return newCart
}

export const clearCart = async (): Promise<void> => {
	await Vtex.cart.clearCart()
}

export const removeClientData = async (): Promise<VtexCart> => {
	await Vtex.cart.removeClientData()
	return await getCart()
}

export const registerToNotify = async (userPayload: unknown): Promise<void> => {
	try {
		Eitri.exposedApis.session.notifyLogin(userPayload)
	} catch (e) {
		console.log('erro on registerToNotify', e)
	}
}

export const removeItemFromCart = async (index: number): Promise<VtexCart> => {
	return await Vtex.cart.removeItem(index)
}

export const cartHasCustomerData = (cart: VtexCart): boolean => {
	return !!(
		cart.clientProfileData &&
		cart.clientProfileData.email &&
		cart.clientProfileData.firstName &&
		cart.clientProfileData.lastName &&
		cart.clientProfileData.document &&
		cart.clientProfileData.phone
	)
}

export interface LoggedCustomer {
	email?: string
	firstName?: string
	lastName?: string
	document?: string
	homePhone?: string
	isCorporate?: boolean
	corporateName?: string
	tradeName?: string
	corporateDocument?: string
	corporatePhone?: string
	stateInscription?: string
	[key: string]: unknown
}

interface PersonalDataContext {
	addPersonalData: (payload: Record<string, unknown>) => Promise<unknown>
}

export const addLoggedCustomerToCart = async (
	loggedCustomer: LoggedCustomer,
	cart: VtexCart,
	context: PersonalDataContext
): Promise<unknown> => {
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

// PURCHASE-PATH FINDING: the real Vtex.checkout.getPixStatus signature requires a third
// `hostStore` argument that neither this wrapper nor its only caller (PixOrder.jsx) ever
// supplies — `hostStore` isn't tracked anywhere in this app. Passing `undefined` here preserves
// today's exact behavior (same as the pre-migration 2-arg JS call), but Pix payment-status
// polling silently running without a host store looks worth a real look, not a type patch.
export const getPixStatus = async (transactionId: string, paymentId: string): Promise<unknown> => {
	return await Vtex.checkout.getPixStatus(transactionId, paymentId, undefined)
}

export const updateOpenTextField = async (
	cart: VtexCart & { openTextField?: { value?: string } },
	receiver?: unknown
): Promise<unknown> => {
	let current: Record<string, unknown> = {}
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
