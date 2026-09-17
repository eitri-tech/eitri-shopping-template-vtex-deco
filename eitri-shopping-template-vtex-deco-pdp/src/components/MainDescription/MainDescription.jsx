import Eitri from 'eitri-bifrost'
import { formatAmount, formatPrice } from '../../utils/utils'
import { useTranslation } from 'eitri-i18n'
import { App } from 'eitri-shopping-vtex-shared'

export default function MainDescription(props) {
	const { product, currentSku, locale, currency } = props

	const { t } = useTranslation()

	const count = useRef(5)

	const discoverInstallments = item => {
		try {
			const mainSeller = item.sellers.find(seller => seller.sellerDefault)
			if (mainSeller) {
				const betterInstallment = mainSeller.commertialOffer.Installments.reduce((acc, installment) => {
					if (!acc) {
						acc = installment
						return acc
					} else {
						if (installment.NumberOfInstallments > acc.NumberOfInstallments) {
							acc = installment
						}
						return acc
					}
				}, null)

				if (betterInstallment.NumberOfInstallments === 1) return ''

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
			text: product?.productId
		})
		count.current = 5
	}

	const mainSeller = currentSku?.sellers?.find(seller => seller.sellerDefault) || currentSku?.sellers?.[0]
	const price = mainSeller?.commertialOffer?.Price
	const listPrice = mainSeller?.commertialOffer?.ListPrice
	const hasDiscount = price < listPrice
	const discountPercentage = hasDiscount ? Math.round((1 - price / listPrice) * 100) : 0

	return (
		<View className='flex flex-col w-full gap-4'>
			<View>
				<View onClick={copyCheckoutId}>
					<Text className='text-xl font-bold'>{product.productName}</Text>
				</View>
			</View>

			<View
				direction='column'
				gap={2}>
				<View className='flex items-center justify-between'>
					<View className='flex items-center gap-2'>
						<Text className='text-neutral-content font-bold text-xl'>
							{formatPrice(price)}
						</Text>
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
							<Text className='text-error text-sm font-bold'>
								{discountPercentage}% off
							</Text>
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
