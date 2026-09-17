export const formatAmountInCents = (amount, locale = 'pt-BR', currency = 'BRL') => {
	if (typeof amount !== 'number') {
		return ''
	}
	if (amount === 0) {
		return 'Grátis'
	}
	return (amount / 100).toLocaleString(locale, { style: 'currency', currency: currency })
}

export const formatDate = date => {
	return new Date(date).toLocaleDateString('pt-br')
}
