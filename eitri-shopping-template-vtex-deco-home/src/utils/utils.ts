import { App } from 'eitri-shopping-vtex-shared'
import Eitri from 'eitri-bifrost'

export const formatPrice = (price?: number, _locale?: string, _currency?: string): string => {
	if (!price) return ''

	const locale = _locale || (App as any)?.configs?.storePreferences?.locale || 'pt-BR'
	const currency = _currency || (App as any)?.configs?.storePreferences?.currencyCode || 'BRL'

	return price.toLocaleString(locale, { style: 'currency', currency: currency })
}

let cartmantCountdown = 10
export const goToCartman = () => {
	if (cartmantCountdown === 0) {
		Eitri.navigation.navigate({ path: 'Cartman' })
		cartmantCountdown = 7
	} else {
		cartmantCountdown--
	}
}
