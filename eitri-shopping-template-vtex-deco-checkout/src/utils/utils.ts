import Eitri from 'eitri-bifrost'

export const formatAmountInCents = (amount: unknown, locale = 'pt-BR', currency = 'BRL'): string => {
	if (typeof amount !== 'number') {
		return ''
	}
	if (amount === 0) {
		return 'Grátis'
	}
	return (amount / 100).toLocaleString(locale, { style: 'currency', currency: currency })
}

export const hideCreditCardNumber = (text?: string): string => {
	return '**** **** **** ' + (text?.replace(/\D+/g, '')?.slice(12) ?? '')
}

export const formatGiftCardRedemptionCode = (redemptionCode?: string): string => {
	// Falling through to `redemptionCode.slice(...)` on a missing code used to throw — the
	// caller only guarded the `.indexOf` above, not this second access.
	if (!redemptionCode) return ''
	if (redemptionCode.indexOf('.') > -1) {
		return redemptionCode.split('.')[0]
	}
	return redemptionCode.slice(0, 20)
}

let cartmantCountdown = 10
export const goToCartman = (): void => {
	if (cartmantCountdown === 0) {
		Eitri.navigation.navigate({ path: 'Cartman' })
		cartmantCountdown = 7
	} else {
		cartmantCountdown--
	}
}
