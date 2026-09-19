import Eitri from 'eitri-bifrost'
import { Vtex } from 'eitri-shopping-vtex-shared'

export const isLoggedIn = async (): Promise<boolean> => {
	return Vtex.customer.isLoggedIn()
}

export const requestLogin = (): Promise<void> => {
	return new Promise((resolve, reject) => {
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

export const closeEitriApp = (): void => {
	Eitri.navigation.close()
}

export const goHome = (): void => {
	Eitri.exposedApis.appState.goHome()
}

export const openAccount = async (): Promise<void> => {
	try {
		Eitri.nativeNavigation.open({
			slug: 'account',
			replace: true,
			initParams: { route: 'OrderList' }
		})
	} catch (e) {
		console.error('navigate to cart: Error trying to open cart', e)
	}
}

export const openCart = async (): Promise<void> => {
	try {
		Eitri.nativeNavigation.open({
			slug: 'cart',
			replace: true
		})
	} catch (e) {
		console.error('navigate to cart: Error trying to open cart', e)
	}
}

export const navigate = (path: string, state: Record<string, unknown> = {}, replace = false): void => {
	Eitri.navigation.navigate({ path, state, replace })
}

export const navigateBack = (): void => {
	// .d.ts declares `steps` as required despite the JSDoc/example showing a zero-arg call.
	Eitri.navigation.back(1)
}
