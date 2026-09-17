import { formatPrice } from '../../utils/utils'
import { App } from 'eitri-shopping-vtex-shared'
import type { VtexInstallment, VtexProduct, VtexSeller } from '../../types/vtex'

export const getProductVideo = (product?: VtexProduct): string => {
	const videoTag = (App as any)?.configs?.appConfigs?.productCard?.productVideoTag
	if (!videoTag) return ''

	const property = product?.properties?.find(prop => prop.name === videoTag)
	return property?.values?.[0] || ''
}

export const formatInstallments = (seller?: VtexSeller): string => {
	if (!seller?.commertialOffer?.Installments?.length) return ''

	const maxInstallments = seller?.commertialOffer?.Installments?.reduce<VtexInstallment | null>((acc, installment) => {
		if (!acc) {
			return installment
		}
		if (installment.InterestRate === 0 && (installment.NumberOfInstallments ?? 0) > (acc.NumberOfInstallments ?? 0)) {
			return installment
		}
		return acc
	}, null)

	if (!maxInstallments || maxInstallments.NumberOfInstallments === 1) return ''

	return `em até ${maxInstallments.NumberOfInstallments}x ${formatPrice(maxInstallments.Value)}`
}

export const calculateBadge = (product?: VtexProduct, sellerDefault?: VtexSeller): string[] => {
	const badges: string[] = []

	if (product?.productClusters?.some(pc => pc.id === '4392')) {
		badges.push('retire em 2h')
	}
	if (
		sellerDefault?.commertialOffer?.teasers?.some(teaser =>
			['compre e ganhe'].some(term => teaser.name?.toLowerCase().includes(term.toLowerCase()))
		)
	) {
		badges.push('leve+ pague-')
	}

	return badges
}

export const getFormattedListPrice = (ListPrice?: number, Price?: number): string => {
	if (Price === ListPrice) return ''

	return formatPrice(ListPrice)
}
