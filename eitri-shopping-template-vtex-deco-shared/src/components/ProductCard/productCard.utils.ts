import { formatPrice } from '../../utils/price'
import { App } from 'eitri-shopping-vtex-shared'
import type { Product, Seller } from '../../types/product'

export const getProductVideo = (product: Product): string => {
	const videoTag = App?.configs?.appConfigs?.productCard?.productVideoTag
	if (!videoTag) return ''

	const property = product?.properties?.find(prop => prop.name === videoTag)
	return property?.values?.[0] || ''
}

export const formatInstallments = (seller: Seller): string => {
	if (!seller?.commertialOffer?.Installments?.length) return ''

	const maxInstallments = seller?.commertialOffer?.Installments?.reduce((acc: any, installment: any) => {
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

	return `${maxInstallments.NumberOfInstallments}x de ${formatPrice(maxInstallments.Value)} sem juros`
}

export const calculateBadge = (product: Product, sellerDefault: Seller): string[] => {
	const badges: string[] = []

	if (product?.productClusters?.some(pc => pc.id === '4392')) {
		badges.push('retire em 2h')
	}
	if (
		sellerDefault?.commertialOffer?.teasers?.some((teaser: any) =>
			['compre e ganhe'].some(term => teaser.name.toLowerCase().includes(term.toLowerCase()))
		)
	) {
		badges.push('leve+ pague-')
	}

	return badges
}

export const getFormattedListPrice = (ListPrice: number, Price: number): string => {
	if (Price === ListPrice) return ''

	return formatPrice(ListPrice)
}
