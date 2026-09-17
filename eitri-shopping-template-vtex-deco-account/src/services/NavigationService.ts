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
	SUBSCRIPTIONS: '/Subscriptions',
	SUBSCRIPTION_DETAILS: '/SubscriptionDetails',
	WISH_LIST: '/WishList',
	ADDRESS_LIST: '/AddressList',
	ADDRESS_FORM: '/AddressForm',
	CHANGE_PASSWORD: '/ChangePassword',
	SAVED_CARDS: '/SavedCards',
	ADD_CARD_FORM: '/AddCardForm'
}

export const openProduct = async (product: VtexProduct): Promise<void> => {
	try {
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
		Eitri.nativeNavigation.open({
			slug: 'cart'
		})
	} catch (e) {
		console.error('Erro ao navegar para o carrinho', e)
	}
}
