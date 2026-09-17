import { Vtex } from 'eitri-shopping-vtex-shared'

export const getCustomerData = async () => {
	try {
		const isLogged = await Vtex.customer.isLoggedIn()
		if (!isLogged) return null
		const result = await Vtex.customer.getCustomerProfile()
		return result?.data?.profile
	} catch (e) {
		return null
	}
}

export const requestLogin = () => {
	return new Promise(async (resolve, reject) => {
		if (await isLoggedIn()) {
			resolve()
			return
		}

		Eitri.nativeNavigation.open({
			slug: 'account',
			initParams: { action: 'RequestLogin', closeAppAfterLogin: true }
		})

		Eitri.navigation.setOnResumeListener(async () => {
			if (await isLoggedIn()) {
				resolve()
			} else {
				reject('User not logged in')
			}
		})
	})
}

export const isLoggedIn = async () => {
	try {
		return await Vtex.customer.isLoggedIn()
	} catch (e) {
		console.error('Erro ao buscar dados do cliente', e)
		return false
	}
}

export async function sendAccessKeyByEmail(email) {
	return await Vtex.customer.sendAccessKeyByEmail(email)
}

export async function loginWithEmailAndKey(email, verificationCode) {
	return await Vtex.customer.loginWithEmailAndAccessKey(email, verificationCode)
}
