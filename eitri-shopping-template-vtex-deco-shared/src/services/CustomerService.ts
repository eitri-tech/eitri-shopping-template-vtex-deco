import { Vtex } from 'eitri-shopping-vtex-shared'
import Eitri from 'eitri-bifrost'

export const doLogin = async (email: string, password: string) => {
	return await Vtex.customer.loginWithEmailAndPassword(email, password)
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

export const getWishlist = async (): Promise<any[]> => {
	const result = await Vtex.wishlist.listItems()
	return result?.data?.viewLists?.[0]?.data || []
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

export const removeItemFromWishlist = async (id: any): Promise<any> => {
	return await Vtex.wishlist.removeItem(id)
}

export const addToWishlist = async (productId: string, title: string, sku: any): Promise<any> => {
	await requestLogin()
	return await Vtex.wishlist.addItem(productId, title, sku)
}
