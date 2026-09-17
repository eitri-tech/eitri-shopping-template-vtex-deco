import Eitri from 'eitri-bifrost'

export const formatAmountInCents = (amount, locale = 'pt-BR', currency = 'BRL') => {
	if (typeof amount !== 'number') {
		return ''
	}
	if (amount === 0) {
		return 'Grátis'
	}
	return (amount / 100).toLocaleString(locale, { style: 'currency', currency: currency })
}

export const hideCreditCardNumber = text => {
	return '**** **** **** ' + text?.replace(/\D+/g, '')?.slice(12)
}

export const formatGiftCardRedemptionCode = redemptionCode => {
	if (redemptionCode?.indexOf('.') > -1) {
		return redemptionCode?.split('.')[0]
	}
	return redemptionCode.slice(0, 20)
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
