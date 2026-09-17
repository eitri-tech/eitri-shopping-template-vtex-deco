import { useRef } from 'react'
import { View, Text } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import { formatAmount, formatPrice } from '../../utils/utils'
import { useTranslation } from 'eitri-i18n'
import { GenericBox } from 'eitri-shopping-template-vtex-deco-shared'
import type { VtexInstallment, VtexProduct, VtexSeller, VtexSku } from '../../types/vtex'

interface MainDescriptionProps {
	product: VtexProduct
	currentSku?: VtexSku
	locale?: string
	currency?: string
}

export default function MainDescription(props: MainDescriptionProps) {
	const { product, currentSku, locale, currency } = props

	const { t } = useTranslation()

	const count = useRef(5)

	const discoverInstallments = (item?: VtexSku): string => {
		try {
			const mainSeller = item?.sellers?.find(seller => seller.sellerDefault)
			if (mainSeller) {
				const betterInstallment = (mainSeller.commertialOffer?.Installments ?? []).reduce<VtexInstallment | null>(
					(acc, installment) => {
						if (!acc) {
							return installment
						} else {
							if ((installment.NumberOfInstallments ?? 0) > (acc.NumberOfInstallments ?? 0)) {
								return installment
							}
							return acc
						}
					},
					null
				)

				if (!betterInstallment || betterInstallment.NumberOfInstallments === 1) return ''

				return `${t('mainDescription.txtUntil', 'ou em até')} ${betterInstallment.NumberOfInstallments}x ${t('mainDescription.txtOf', 'de')} ${formatAmount(betterInstallment.Value, locale, currency)}`
			}
			return ''
		} catch (error) {
			return ''
		}
	}

	const copyCheckoutId = () => {
		if (count.current > 0) {
			count.current -= 1
			return
		}
		Eitri.clipboard.setText({
			text: product?.productId ?? ''
		})
		count.current = 5
	}

	const mainSeller: VtexSeller | undefined = currentSku?.sellers?.find(seller => seller.sellerDefault) || currentSku?.sellers?.[0]

	return (
		<GenericBox className='flex flex-col'>
			<View>
				<View onClick={copyCheckoutId}>
					<Text className='text-xl font-bold'>{product.productName}</Text>
				</View>
				{product?.productReference && (
					<>
						<Text className='text-neutral-content pt-1 text-gray-400'>
							{`ref ${product?.productReference}`}
						</Text>
					</>
				)}
			</View>

			{/* `direction`/`gap` aren't real View props (CommonProps has neither) — this never
			laid out as intended. The correct API is `orientation` + Tailwind gap classes. */}
			<View className='flex flex-col gap-2'>
				{(mainSeller?.commertialOffer?.Price ?? 0) < (mainSeller?.commertialOffer?.ListPrice ?? 0) && (
					<Text className='text-sm text-neutral-content line-through'>
						{formatPrice(mainSeller?.commertialOffer?.ListPrice)}
					</Text>
				)}
				<View>
					<Text className='text-primary font-bold text-xl'>
						{formatPrice(mainSeller?.commertialOffer?.Price)}
					</Text>
				</View>

				{discoverInstallments(currentSku) && (
					<Text className='text-sm text-neutral-content'>{discoverInstallments(currentSku)}</Text>
				)}
			</View>
		</GenericBox>
	)
}
