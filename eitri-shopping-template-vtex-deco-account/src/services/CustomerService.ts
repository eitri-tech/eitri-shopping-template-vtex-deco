import { Vtex } from 'eitri-shopping-vtex-shared'

export const doLogin = async (email, password, rememberMe) => {
	return await Vtex.customer.loginWithEmailAndPassword(email, password, rememberMe)
}

export async function loginWithEmailAndKey(email, verificationCode) {
	return await Vtex.customer.loginWithEmailAndAccessKey(email, verificationCode)
}

export async function sendAccessKeyByEmail(email) {
	return await Vtex.customer.sendAccessKeyByEmail(email)
}

export const doLogout = async () => {
	return await Vtex.customer.logout()
}

export const removeClientData = async () => {
	return await Vtex.cart.removeClientData()
}

export const isLoggedIn = async () => {
	const session = await Vtex.session.getSession()
	return session?.namespaces?.profile?.isAuthenticated?.value === 'true'
}

export const getSavedUser = async () => {
	return await Vtex.customer.retrieveCustomerData()
}

export const sendPasswordResetCode = async userEmail => {
	return await Vtex.customer.sendAccessKeyByEmail(userEmail)
}

export const setPassword = async (email, accessKey, newPassword) => {
	return await Vtex.customer.setPassword(email, accessKey, newPassword)
}

export const changePassword = async (email, currentPassword, newPassword) => {
	return await Vtex.customer.setPassword(email, '', newPassword, currentPassword)
}

export const getCustomerData = async () => {
	try {
		const result = await Vtex.customer.getCustomerProfile()
		const profile = result?.data?.profile
		return profile
	} catch (e) {
		console.log('getCustomerData error', e)
	}
}

export const setCustomerData = async profileData => {
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

export const removeFromWishlist = async wishListItemId => {
	return await Vtex.wishlist.removeItem(wishListItemId)
}

export async function loginWithGoogle() {
	return await Vtex.customer.loginWithGoogle()
}

export async function loginWithFacebook() {
	return await Vtex.customer.loginWithFacebook()
}

export const listOrders = async page => {
	return await Vtex.customer.listOrders(page)
}

export const getOrderById = async orderId => {
	return await Vtex.customer.getOrderById(orderId)
}

export const saveUserEmailOnStorage = async email => {
	return await Vtex.customer.setCustomerData('email', email)
}

export const loadUserEmailFromStorage = async () => {
	return await Vtex.customer.getCustomerData('email')
}

export const productOnWishlist = async productId => {
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

export const removeItemFromWishlist = async id => {
	return await Vtex.wishlist.removeItem(id)
}

export const addToWishlist = async (productId, title, sku) => {
	return await Vtex.wishlist.addItem(productId, title, sku)
}

export const getSavedCards = async () => {
	const result = await Vtex.customer.getSavedCards()
	return result?.payments || []
}

export const addNewCard = async (cardData, recaptchaToken) => {
	return await Vtex.customer.addNewCard(cardData, recaptchaToken)
}

export const deleteSavedCard = async cardId => {
	return await Vtex.customer.deleteSavedCard(cardId)
}
