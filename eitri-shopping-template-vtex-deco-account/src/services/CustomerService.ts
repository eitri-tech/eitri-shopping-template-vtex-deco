import { Vtex } from 'eitri-shopping-vtex-shared'
import type { VtexCustomerProfile, VtexSavedCard } from '../types/vtex'

export const doLogin = async (email: string, password: string, rememberMe?: boolean) => {
	// loginWithEmailAndPassword only accepts (email, password) — rememberMe was already a no-op
	// at runtime (JS ignores extra call arguments); kept in this wrapper's own signature for
	// callers, just not forwarded.
	return await Vtex.customer.loginWithEmailAndPassword(email, password)
}

export async function loginWithEmailAndKey(email: string, verificationCode: string) {
	return await Vtex.customer.loginWithEmailAndAccessKey(email, verificationCode)
}

export async function sendAccessKeyByEmail(email: string) {
	return await Vtex.customer.sendAccessKeyByEmail(email)
}

export const doLogout = async () => {
	return await Vtex.customer.logout()
}

export const removeClientData = async () => {
	return await Vtex.cart.removeClientData()
}

export const isLoggedIn = async (): Promise<boolean> => {
	const session = await Vtex.session.getSession()
	return session?.namespaces?.profile?.isAuthenticated?.value === 'true'
}

export const getSavedUser = async () => {
	return await Vtex.customer.retrieveCustomerData()
}

export const sendPasswordResetCode = async (userEmail: string) => {
	return await Vtex.customer.sendAccessKeyByEmail(userEmail)
}

export const setPassword = async (email: string, accessKey: string, newPassword: string) => {
	// setPassword requires a 4th `currentPassword` argument — this is the access-key reset flow,
	// where there is no current password to send.
	return await Vtex.customer.setPassword(email, accessKey, newPassword, '')
}

export const changePassword = async (email: string, currentPassword: string, newPassword: string) => {
	return await Vtex.customer.setPassword(email, '', newPassword, currentPassword)
}

export const getCustomerData = async (): Promise<VtexCustomerProfile | undefined> => {
	try {
		// The lib's .d.ts declares a required `_token` param that this pre-existing call never
		// provided — the leading underscore suggests it's vestigial/unused internally.
		const result = await (Vtex.customer.getCustomerProfile as () => Promise<any>)()
		const profile = result?.data?.profile
		return profile
	} catch (e) {
		console.log('getCustomerData error', e)
	}
}

export const setCustomerData = async (profileData: VtexCustomerProfile) => {
	try {
		const payload = {
			firstName: profileData.firstName,
			lastName: profileData.lastName,
			email: profileData.email,
			document: profileData.document,
			homePhone: profileData.homePhone,
			gender: profileData.gender,
			birthDate: profileData.birthDate,
			corporateName: profileData.corporateName,
			corporateDocument: profileData.corporateDocument,
			businessPhone: profileData.businessPhone,
			stateRegistration: profileData.stateRegistration,
			tradeName: profileData.tradeName,
			isCorporate: profileData.isCorporate
		}
		const result = await Vtex.customer.updateCustomerProfile(payload)
		const updateProfile = result?.data?.updateProfile
		return updateProfile
	} catch (e) {
		console.log('setCustomerData error', e)
	}
}

export const getWishlist = async () => {
	const result = await Vtex.wishlist.listItems()
	return result?.data?.viewLists?.[0]?.data || []
}

export const removeFromWishlist = async (wishListItemId: string) => {
	return await Vtex.wishlist.removeItem(wishListItemId)
}

export async function loginWithGoogle() {
	return await Vtex.customer.loginWithGoogle()
}

export async function loginWithFacebook() {
	return await Vtex.customer.loginWithFacebook()
}

export const listOrders = async (page: number) => {
	return await Vtex.customer.listOrders(page)
}

export const getOrderById = async (orderId: string) => {
	return await Vtex.customer.getOrderById(orderId)
}

export const saveUserEmailOnStorage = async (email: string) => {
	return await Vtex.customer.setCustomerData('email', email)
}

export const loadUserEmailFromStorage = async () => {
	return await Vtex.customer.getCustomerData('email')
}

export const productOnWishlist = async (productId: string): Promise<{ inList: boolean; listId?: string }> => {
	if (!(await isLoggedIn())) {
		return { inList: false }
	}
	const result = await Vtex.wishlist.checkItem(productId)
	const inList = result?.data?.checkList?.inList
	if (inList) {
		const listId = result?.data?.checkList?.listIds?.[0]
		return { inList, listId }
	} else {
		return { inList }
	}
}

export const removeItemFromWishlist = async (id: string) => {
	return await Vtex.wishlist.removeItem(id)
}

export const addToWishlist = async (productId: string, title: string, sku: string) => {
	return await Vtex.wishlist.addItem(productId, title, sku)
}

export const getSavedCards = async (): Promise<VtexSavedCard[]> => {
	const result = await Vtex.customer.getSavedCards()
	return result?.payments || []
}

export const addNewCard = async (cardData: Record<string, unknown>, recaptchaToken: string) => {
	return await Vtex.customer.addNewCard(cardData, recaptchaToken)
}

export const deleteSavedCard = async (cardId: string) => {
	return await Vtex.customer.deleteSavedCard(cardId)
}
