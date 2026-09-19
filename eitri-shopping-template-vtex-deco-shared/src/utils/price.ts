import { App } from 'eitri-shopping-vtex-shared'

/**
 * Formata um preço numérico para a moeda da loja (BRL/pt-BR por padrão).
 * Portado de `home/src/utils/utils.js`.
 */
export const formatPrice = (price?: number, _locale?: string, _currency?: string): string => {
	if (!price) return ''

	// App.configs is typed as { verbose, gaVerbose } in the generated stub — cast narrowly.
	const locale = _locale || (App as any)?.configs?.storePreferences?.locale || 'pt-BR'
	const currency = _currency || (App as any)?.configs?.storePreferences?.currencyCode || 'BRL'

	return price.toLocaleString(locale, { style: 'currency', currency: currency })
}
