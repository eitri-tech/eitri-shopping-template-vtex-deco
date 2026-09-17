export const formatAmountInCents = (amount: unknown, locale = 'pt-BR', currency = 'BRL'): string => {
	if (typeof amount !== 'number') {
		return ''
	}
	if (amount === 0) {
		return 'Grátis'
	}
	return (amount / 100).toLocaleString(locale, { style: 'currency', currency: currency })
}

export const formatDate = (date: Date | string | number): string => {
	return new Date(date).toLocaleDateString('pt-br')
}
