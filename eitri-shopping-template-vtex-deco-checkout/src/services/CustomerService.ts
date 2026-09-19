import { Vtex } from 'eitri-shopping-vtex-shared'
import Eitri from 'eitri-bifrost'

export const getCustomerData = async (): Promise<unknown | null> => {
	try {
		const isLogged = await Vtex.customer.isLoggedIn()
		if (!isLogged) return null
		// Vtex.customer.getCustomerProfile's `_token` param is typed required (its underscore
		// prefix suggests it's actually unused internally) — the existing call never passed one.
		const result = await Vtex.customer.getCustomerProfile(undefined)
		return result?.data?.profile
	} catch (e) {
		return null
	}
}

export const requestLogin = (): Promise<void> => {
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

export const isLoggedIn = async (): Promise<boolean> => {
	try {
		return await Vtex.customer.isLoggedIn()
	} catch (e) {
		console.error('Erro ao buscar dados do cliente', e)
		return false
	}
}

export async function sendAccessKeyByEmail(email: string): Promise<unknown> {
	return await Vtex.customer.sendAccessKeyByEmail(email)
}

export async function loginWithEmailAndKey(email: string, verificationCode: string): Promise<unknown> {
	return await Vtex.customer.loginWithEmailAndAccessKey(email, verificationCode)
}

export async function removeAccount(accountId: string): Promise<unknown> {
	// Lives on the checkout service, not customer — `Vtex.customer.removeAccount` doesn't exist.
	return await Vtex.checkout.removeAccount(accountId)
}
