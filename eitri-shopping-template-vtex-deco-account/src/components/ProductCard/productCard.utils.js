import { formatPrice } from '../../utils/utils'
import { App } from 'eitri-shopping-vtex-shared'

export const getProductVideo = product => {
	const videoTag = App?.configs?.appConfigs?.productCard?.productVideoTag
	if (!videoTag) return ''

	const property = product?.properties?.find(prop => prop.name === videoTag)
	return property?.values?.[0] || ''
}

export const formatInstallments = seller => {
	if (!seller?.commertialOffer?.Installments?.length) return ''

	const maxInstallments = seller?.commertialOffer?.Installments?.reduce((acc, installment) => {
		if (!acc) {
			acc = installment
			return acc
		}
		if (installment.InterestRate === 0 && installment.NumberOfInstallments > acc.NumberOfInstallments) {
			acc = installment
		}
		return acc
	}, null)

	if (!maxInstallments || maxInstallments.NumberOfInstallments === 1) return ''

	return `em até ${maxInstallments.NumberOfInstallments}x ${formatPrice(maxInstallments.Value)}`
}

export const calculateBadge = (product, sellerDefault) => {
	const badges = []

	if (product?.productClusters?.some(pc => pc.id === '4392')) {
		badges.push('retire em 2h')
	}
	if (
		sellerDefault?.commertialOffer?.teasers?.some(teaser =>
			['compre e ganhe'].some(term => teaser.name.toLowerCase().includes(term.toLowerCase()))
		)
	) {
		badges.push('leve+ pague-')
	}

	return badges
}

export const getFormattedListPrice = (ListPrice, Price) => {
	if (Price === ListPrice) return ''

	return formatPrice(ListPrice)
}
