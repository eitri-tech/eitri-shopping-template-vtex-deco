import { App } from 'eitri-shopping-vtex-shared'

export const formatPrice = (price?: number, _locale?: string, _currency?: string): string => {
	if (!price) return ''

	const locale = _locale || (App as any)?.configs?.storePreferences?.locale || 'pt-BR'
	const currency = _currency || (App as any)?.configs?.storePreferences?.currencyCode || 'BRL'

	return price.toLocaleString(locale, { style: 'currency', currency: currency })
}

/**
 * Currency prefixed with an explicit +/- sign, used by the bonus statement
 * ("+R$ 7.702,83" for credits, "-R$ 5.000,00" for redemptions).
 */
export const formatSignedPrice = (value?: number, _locale?: string, _currency?: string): string => {
	if (typeof value !== 'number') return ''

	const locale = _locale || (App as any)?.configs?.storePreferences?.locale || 'pt-BR'
	const currency = _currency || (App as any)?.configs?.storePreferences?.currencyCode || 'BRL'

	const amount = Math.abs(value).toLocaleString(locale, { style: 'currency', currency: currency })
	return `${value < 0 ? '-' : '+'}${amount}`
}

export const formatPriceInCents = (price: unknown, _locale?: string, _currency?: string): string => {
	if (typeof price !== 'number') {
		return ''
	}
	if (price === 0) {
		return 'Grátis'
	}
	return formatPrice(price / 100, _locale, _currency)
}

export const formatDateDaysMonthYear = (date: Date | string | number): string => {
	const data = new Date(date)
	const dia = data.getDate()
	const mes = data.toLocaleString('pt-BR', { month: 'long' })
	const ano = data.getFullYear()
	return `${dia} de ${mes} de ${ano}`
}

export const formatDate = (date: Date | string | number): string => {
	return new Date(date).toLocaleDateString('pt-br')
}
export default function formatDateMMDDYYYY(isoDate?: string): string {
	if (!isoDate) return ''

	const date = new Date(isoDate)

	const day = String(date.getUTCDate()).padStart(2, '0')
	const month = String(date.getUTCMonth() + 1).padStart(2, '0') // Janeiro é 0!
	const year = date.getUTCFullYear()

	return `${day}/${month}/${year}`
}
