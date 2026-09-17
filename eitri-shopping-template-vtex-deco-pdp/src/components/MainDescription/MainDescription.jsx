import Eitri from 'eitri-bifrost'
import { formatAmount, formatPrice } from '../../utils/utils'
import { useTranslation } from 'eitri-i18n'
import { GenericBox } from 'eitri-shopping-template-vtex-deco-shared'
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
			text: product?.productId
		})
		count.current = 5
	}

	const mainSeller = currentSku?.sellers?.find(seller => seller.sellerDefault) || currentSku?.sellers?.[0]

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

			<View
				direction='column'
				gap={2}>
				{mainSeller?.commertialOffer?.Price < mainSeller?.commertialOffer?.ListPrice && (
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
