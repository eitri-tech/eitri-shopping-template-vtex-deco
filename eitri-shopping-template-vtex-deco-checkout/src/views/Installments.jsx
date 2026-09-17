import { useLocalShoppingCart } from '../providers/LocalCart'
import { useTranslation } from 'eitri-i18n'
import {
	HeaderContentWrapper,
	HeaderReturn,
	HeaderText,
	BottomInset,
	TrackingService,
	Loading
} from 'eitri-shopping-template-vtex-deco-shared'
import { formatAmountInCents } from '../utils/utils'
import { useState } from 'react'
import { Page, Text, View } from 'eitri-luminus'
import CardIcon from '../components/Icons/CardIcons/CardIcon'
import { navigate } from '../services/navigationService'

export default function Installments(props) {
	const paymentSystem = props.location?.state?.paymentSystem
	const description = props.location?.state?.description

	const { cart, cardInfo, selectPaymentOption } = useLocalShoppingCart()
	const { t } = useTranslation()

	const [isLoading, setIsLoading] = useState(false)

	const installmentOption = cart?.paymentData?.installmentOptions?.find(
		i => i.paymentSystem === paymentSystem?.stringId
	)

	useEffect(() => {
		TrackingService.sendScreenView('Seleção de parcelas', 'Installments')
	}, [])

	// console.log('paymentSystem', cart?.orderFormId, installmentOption)

	const installments = installmentOption?.installments || []

	const handleInstallmentSelect = async installment => {
		try {
			setIsLoading(true)

			// Atualizar os dados de pagamento com a parcela selecionada
			if (cart?.paymentData?.payments) {
				const updatedPayments = cart?.paymentData?.payments?.map(payment => {
					if (payment.paymentSystem === paymentSystem?.stringId) {
						return {
							...payment,
							installmentsInterestRate: installment?.interestRate ?? 0,
							installments: installment.count
						}
					}
					return payment
				})

				const payload = {
					payments: updatedPayments,
					giftCards: cart?.paymentData?.giftCards
				}

				await selectPaymentOption(payload)
			}

			navigate('CheckoutReview', {}, true)
		} catch (error) {
			console.error('Erro ao selecionar parcela:', error)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Page title='Seleção de parcelas'>
			<View className='p-4 pt-8 h-min-screen flex flex-col'>
				<HeaderContentWrapper>
					<HeaderReturn />
					<HeaderText text={t('installments.txtHeader')} />
				</HeaderContentWrapper>

				<Loading
					fullScreen
					isLoading={isLoading}
				/>

				<View className='bg-white rounded shadow-sm border border-gray-200 p-4 mb-6 flex flex-row items-center gap-3'>
					<View className='flex justify-center items-center w-[40px]'>
						<CardIcon
							width={'100%'}
							iconKey={paymentSystem?.name}
						/>
					</View>
					{paymentSystem?.groupName === 'WH Google PayPaymentGroup' ? (
						<Text className='text font-bold text-neutral-900'>{description || 'Google Pay'}</Text>
					) : (
						<Text className='text font-bold text-neutral-900'>
							{`${paymentSystem?.name || 'Cartão de Crédito'} com final ${cardInfo?.cardNumber?.slice(-4)}`}
						</Text>
					)}
				</View>

				<View className='flex flex-col gap-3'>
					{installments.map((installment, index) => {
						return (
							<View
								key={index}
								onClick={() => !isLoading && handleInstallmentSelect(installment)}
								className={`border bg-white p-4 rounded flex flex-row items-center justify-between`}>
								<View className='flex flex-col'>
									<Text className='text-lg font-bold text-neutral-900'>
										{`${installment.count}x ${formatAmountInCents(installment.value)}`}
									</Text>
									{installment.count > 1 && (
										<Text className='text-sm text-neutral-500'>
											{installment.hasInterestRate ? t('installments.txtWithInterest') : t('installments.txtNoInterest')}
										</Text>
									)}
								</View>
								<View className='flex flex-row items-center gap-2'>
									{installment.count > 1 && (
										<Text className='text-sm text-neutral-600'>
											{formatAmountInCents(installment.total)}
										</Text>
									)}

									<View>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											width='24'
											height='24'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='2'
											strokeLinecap='round'
											strokeLinejoin='round'
											className='text-primary'>
											<polyline points='9 18 15 12 9 6'></polyline>
										</svg>
									</View>
								</View>
							</View>
						)
					})}
				</View>

				<BottomInset />
			</View>
		</Page>
	)
}
