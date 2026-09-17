import { App } from 'eitri-shopping-vtex-shared'

/**
 * Formata um preço numérico para a moeda da loja (BRL/pt-BR por padrão).
 * Portado de `home/src/utils/utils.js`.
 */
export const formatPrice = (price?: number, _locale?: string, _currency?: string): string => {
	if (!price) return ''

	const locale = _locale || App?.configs?.storePreferences?.locale || 'pt-BR'
	const currency = _currency || App?.configs?.storePreferences?.currencyCode || 'BRL'

	return price.toLocaleString(locale, { style: 'currency', currency: currency })
}
