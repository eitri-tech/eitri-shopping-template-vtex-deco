import { formatPrice } from '../../utils/utils'
import { App } from 'eitri-shopping-vtex-shared'
import type { VtexCommertialOffer, VtexInstallment, VtexProduct } from '../../types/vtex'

// App.configs is typed as { verbose, gaVerbose } in the generated stub for eitri-shopping-vtex-shared
// (see the eitri-typescript-migrate skill's "shared-library @types cache trap") — cast narrowly to
// the one nested field this app actually reads at runtime.
const productVideoTag = (
	App?.configs as { appConfigs?: { productCard?: { productVideoTag?: string } } } | undefined
)?.appConfigs?.productCard?.productVideoTag

export const getProductVideo = (product?: VtexProduct): string => {
	if (!productVideoTag) return ''

	const property = product?.properties?.find(prop => prop.name === productVideoTag)
	return property?.values?.[0] || ''
}

export const formatInstallments = (seller?: { commertialOffer?: VtexCommertialOffer }): string => {
	if (!seller?.commertialOffer?.Installments?.length) return ''

	const maxInstallments = seller?.commertialOffer?.Installments?.reduce<VtexInstallment | null>((acc, installment) => {
		if (!acc) {
			acc = installment
			return acc
		}
		if (
			installment.InterestRate === 0 &&
			(installment.NumberOfInstallments ?? 0) > (acc.NumberOfInstallments ?? 0)
		) {
			acc = installment
		}
		return acc
	}, null)

	if (!maxInstallments || maxInstallments.NumberOfInstallments === 1) return ''

	return `${maxInstallments.NumberOfInstallments}x de ${formatPrice(maxInstallments.Value)} sem juros`
}

export const calculateBadge = (product?: VtexProduct, sellerDefault?: { commertialOffer?: VtexCommertialOffer }): string[] => {
	const badges: string[] = []

	if (product?.productClusters?.some(pc => pc.id === '4392')) {
		badges.push('retire em 2h')
	}
	if (
		sellerDefault?.commertialOffer?.teasers?.some(teaser =>
			['compre e ganhe'].some(term => (teaser.name ?? '').toLowerCase().includes(term.toLowerCase()))
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
