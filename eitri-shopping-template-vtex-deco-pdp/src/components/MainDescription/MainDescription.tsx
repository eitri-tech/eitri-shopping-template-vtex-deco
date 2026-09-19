import { useRef } from 'react'
import { View, Text } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import { formatAmount, formatPrice } from '../../utils/utils'
import { useTranslation } from 'eitri-i18n'
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

				const interestFree = betterInstallment.InterestRate === 0
				return `${betterInstallment.NumberOfInstallments}X ${t('mainDescription.txtOf', 'de')} ${formatAmount(betterInstallment.Value, locale, currency)}${interestFree ? ` ${t('mainDescription.txtInterestFree', 'sem juros')}` : ''}`
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

	const mainSeller: VtexSeller | undefined =
		currentSku?.sellers?.find(seller => seller.sellerDefault) || currentSku?.sellers?.[0]
	const price = mainSeller?.commertialOffer?.Price
	const listPrice = mainSeller?.commertialOffer?.ListPrice
	const hasDiscount = price != null && listPrice != null && listPrice > 0 && price < listPrice
	const discountPercentage = hasDiscount ? Math.round((1 - price / listPrice) * 100) : 0

	return (
		<View className='flex flex-col w-full gap-4'>
			<View>
				<View onClick={copyCheckoutId}>
					<Text className='text-xl font-bold'>{product.productName}</Text>
				</View>
			</View>

			{/* `direction`/`gap` aren't real View props (CommonProps has neither) — this never
			laid out as intended. The correct API is `orientation` + Tailwind gap classes. */}
			<View className='flex flex-col gap-2'>
				<View className='flex items-center justify-between'>
					<View className='flex items-center gap-2'>
						<Text className='text-neutral-content font-bold text-xl'>{formatPrice(price)}</Text>
						{hasDiscount && (
							<>
								<Text className='text-sm text-neutral-content'>|</Text>
								<Text className='text-sm text-neutral-content line-through'>
									{formatPrice(listPrice)}
								</Text>
							</>
						)}
					</View>
					{hasDiscount && (
						<View>
							<Text className='text-error text-sm font-bold'>{discountPercentage}% off</Text>
						</View>
					)}
				</View>

				{discoverInstallments(currentSku) && (
					<Text className='text-sm text-neutral-content'>{discoverInstallments(currentSku)}</Text>
				)}
			</View>
		</View>
	)
}
