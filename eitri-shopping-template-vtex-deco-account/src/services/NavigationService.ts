import Eitri from 'eitri-bifrost'
import type { VtexProduct } from '../types/vtex'

export const PAGES = {
	HOME: '/Home',
	SIGNIN: '/SignIn',
	SIGNUP: '/SignUp',
	PASSWORD_RESET: '/PasswordReset',
	PASSWORD_RESET_CODE: '/PasswordResetCode',
	PASSWORD_RESET_NEW_PASS: '/PasswordResetNewPass',
	LOGIN: '/Login/Login',
	EDIT_PROFILE: '/EditProfile',
	ORDER_LIST: '/OrderList',
	ORDER_DETAILS: '/OrderDetails',
	WISH_LIST: '/WishList',
	ADDRESS_LIST: '/AddressList',
	ADDRESS_FORM: '/AddressForm',
	CHANGE_PASSWORD: '/ChangePassword',
	SAVED_CARDS: '/SavedCards',
	ADD_CARD_FORM: '/AddCardForm',
	AUTH_SELECT: '/AuthSelect',
	SIGNIN_VARIANT: '/SignInVariant',
	BONUS: '/Bonus'
}

export const openProduct = async (product: VtexProduct): Promise<void> => {
	try {
		Eitri.bottomBar.show().catch(() => {})
		Eitri.nativeNavigation.open({
			slug: 'pdp',
			initParams: { product }
		})
	} catch (e) {
		console.error('navigate to cart: Error trying to open product', e)
	}
}

export const navigate = (page: string, state: Record<string, unknown> = {}, replace = false) => {
	return Eitri.navigation.navigate({ path: page, state, replace })
}

export const openCart = async (): Promise<void> => {
	try {
		Eitri.bottomBar.show().catch(() => {})
		Eitri.nativeNavigation.open({
			slug: 'cart'
		})
	} catch (e) {
		console.error('Erro ao navegar para o carrinho', e)
	}
}

export const openCategories = async () => {
	try {
		Eitri.bottomBar.show().catch(() => {})
		Eitri.nativeNavigation.open({
			slug: 'home',
			initParams: { route: 'Categories', returnTo: 'Wishlist' }
		})
	} catch (e) {
		console.error('Erro ao navegar para categorias', e)
	}
}

export const openSearch = async () => {
	try {
		Eitri.bottomBar.show().catch(() => {})
		Eitri.nativeNavigation.open({
			slug: 'home',
			initParams: { route: 'Search' }
		})
	} catch (e) {
		console.error('Erro ao navegar para busca', e)
	}
}
