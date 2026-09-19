import { useEffect, useState } from 'react'
import { Page, View, Text } from 'eitri-luminus'
import { useLocalShoppingCart } from '../providers/LocalCart'
import { useTranslation } from 'eitri-i18n'
import PaymentMethods from '../components/Methods/PaymentMethods'
import {
	HeaderContentWrapper,
	HeaderReturn,
	BottomInset,
	TrackingService,
	Loading
} from 'eitri-shopping-template-vtex-deco-shared'
import type { VtexPaymentPayload } from '../types/vtex'

export default function PaymentData() {
	const { cart, selectPaymentOption } = useLocalShoppingCart()
	const { t } = useTranslation()

	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		TrackingService.sendScreenView('Dados de pagamento', 'PaymentData')
	}, [])

	const handlePaymentOptionsChange = async (paymentMethod: VtexPaymentPayload | VtexPaymentPayload[]) => {
		try {
			setIsLoading(true)
			const payload = {
				payments: Array.isArray(paymentMethod) ? paymentMethod : [paymentMethod],
				giftCards: cart?.paymentData?.giftCards
			}
			await selectPaymentOption?.(payload)
		} catch (error) {
			console.log('Erro ao selecionar método de pagamento', error)
		} finally {
			setIsLoading(false)
		}
	}

	if (!cart) {
		return null
	}

	return (
		<Page title='Dados de pagamento'>
			<HeaderContentWrapper>
				<HeaderReturn />
			</HeaderContentWrapper>

			<Loading
				fullScreen
				isLoading={isLoading}
			/>

			<View className='flex-1 p-4 flex flex-col gap-4'>
				<Text className='text-xl font-bold'>{t('paymentData.txtTitle')}</Text>
				<PaymentMethods onSelectPaymentMethod={handlePaymentOptionsChange} />
			</View>

			<BottomInset />
		</Page>
	)
}
