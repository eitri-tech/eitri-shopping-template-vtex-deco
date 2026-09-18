import { useEffect, useRef, useState } from 'react'
import { Page, View, Text, Image } from 'eitri-luminus'
import { useLocalShoppingCart } from '../providers/LocalCart'
import { clearCart, startPayment } from '../services/cartService'
import Recaptcha from '../services/Recaptcha'
import type { RecaptchaHandle } from '../services/Recaptcha'
import UserData from '../components/FinishCart/UserData'
import SelectedPaymentData from '../components/FinishCart/SelectedPaymentData'
import DeliveryData from '../components/FinishCart/DeliveryData'
import { useTranslation } from 'eitri-i18n'
import CartSummary from '../components/CartSummary/CartSummary'
import { navigate } from '../services/navigationService'
import OtpLogin from '../components/OtpLogin/OtpLogin'
import { ERROR_MAP } from '../utils/vtexErrorMap'
import {
	HeaderContentWrapper,
	HeaderReturn,
	BottomInset,
	CustomButton,
	TrackingService,
	Loading
} from 'eitri-shopping-template-vtex-deco-shared'
import Eitri from 'eitri-bifrost'
import type { VtexCartItem } from '../types/vtex'

// startPayment is typed Promise<unknown> in cartService — narrow here before reading the response fields.
interface PaymentResult {
	orderId?: string
	status?: string
	paymentAuthorizationAppCollection?: Array<{ appName?: string; [key: string]: unknown }>
	[key: string]: unknown
}

export default function CheckoutReview() {
	const { cart, cardInfo, cartIsLoading, removeCartItem } = useLocalShoppingCart()
	const { t } = useTranslation()

	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState({ state: false, message: '' })
	const [unavailableItems, setUnavailableItems] = useState<VtexCartItem[]>([])
	const [showOtpLogin, setShowOtpLogin] = useState(false)
	const [recaptchaSiteKey, setRecaptchaSiteKey] = useState('')

	const recaptchaRef = useRef<RecaptchaHandle>(null)

	useEffect(() => {
		Eitri.environment.getRemoteConfigs().then(rc => {
			const recaptchaSiteKey = rc?.appConfigs?.checkout?.recaptchaKey
			if (recaptchaSiteKey) {
				setRecaptchaSiteKey(recaptchaSiteKey)
			}
		})
	}, [])

	useEffect(() => {
		TrackingService.sendScreenView('Revisão do pedido', 'CheckoutReview')
	}, [])

	useEffect(() => {
		if (cart && cart?.items?.length > 0) {
			const unavailableItems = cart?.items?.filter(item => item.availability !== 'available')
			if (unavailableItems.length > 0) {
				setUnavailableItems(unavailableItems)
			} else {
				setUnavailableItems([])
			}
		}
	}, [cart])

	const runPaymentScript = async () => {
		try {
			setIsLoading(true)

			const captchaToken = await recaptchaRef?.current?.getRecaptchaToken()

			const payload = {
				fields: cardInfo,
				captchaToken: captchaToken,
				captchaSiteKey: recaptchaSiteKey,
				savePersonalData: true,
				optinNewsLetter: false
			}

			if (!cart) return

			const paymentResult = (await startPayment(cart, payload)) as PaymentResult

			TrackingService.purchaseEvent(cart, paymentResult.orderId)

			if (paymentResult.status === 'completed') {
				clearCart()
				navigate('OrderCompleted', {
					orderId: paymentResult.orderId,
					orderValue: cart.value
				})
				return
			}

			if (paymentResult?.paymentAuthorizationAppCollection?.[0]?.appName === 'vtex.pix-payment') {
				navigate('PixOrder', { paymentResult })
				return
			}

			navigate('ExternalProviderOrder', { paymentResult })
		} catch (error) {
			const err = error as { response?: { data?: { error?: { code?: string; message?: string } } }; message?: string }
			const errorCode = err.response?.data?.error?.code

			if (errorCode === 'CHK003' || errorCode === 'CHK0087' || errorCode === 'ORD062') {
				setShowOtpLogin(true)
				return
			}

			if (err.message) {
				try {
					const parsedError = JSON.parse(err.message) as Array<{ code?: string; text?: string }>
					const minimumPaymentError = parsedError.find(e => e.code === 'ORD079')
					if (minimumPaymentError) {
						setError({
							state: true,
							message: minimumPaymentError.text ?? ''
						})
						return
					}
				} catch (e) {
					// ignore — err.message wasn't JSON
				}
			}

			setError({
				state: true,
				message: (errorCode && ERROR_MAP[errorCode]) || err.response?.data?.error?.message || t('checkoutReview.txtError')
			})

			setIsLoading(false)
			setTimeout(() => {
				setError({ state: false, message: '' })
			}, 5000)
		} finally {
			setIsLoading(false)
		}
	}

	const isReadyToPay = () => {
		return (
			unavailableItems.length === 0 &&
			(cart?.items?.length ?? 0) > 0 &&
			!!cart?.shippingData?.address &&
			!!cart?.shippingData?.address?.number
		)
	}

	const removeUnavailableItem = async (uItem: VtexCartItem) => {
		try {
			setIsLoading(true)
			const index = cart?.items.findIndex(item => item.uniqueId === uItem.uniqueId) ?? -1
			if (index !== -1) {
				await removeCartItem?.(index)
			}
			setIsLoading(false)
		} catch (e) {
			console.error('Error on removeUnavailableItem', e)
			setIsLoading(false)
		}
	}

	const handleLogged = async () => {
		setShowOtpLogin(false)
		runPaymentScript()
	}

	return (
		<Page title='Revisão do pedido'>
			<HeaderContentWrapper>
				<HeaderReturn />
			</HeaderContentWrapper>

			<Loading
				fullScreen
				isLoading={cartIsLoading || isLoading}
			/>

			<View className='p-4'>
				<View className='mb-2'>
					<Text className='text-xl font-bold'>{t('checkoutReview.txtTitle')}</Text>
				</View>

				{/* Adiciona padding-bottom para não sobrepor o botão */}
				<>
					{unavailableItems.length > 0 && (
						<View className='mb-4 p-4 bg-red-50 border border-red-200 rounded'>
							<Text className='text-sm text-red-600 font-medium'>{t('finishCart.errorItems')}</Text>

							{unavailableItems.map(uItem => (
								<View
									className='flex items-center justify-between gap-2 mt-2'
									key={uItem.uniqueId}>
									<View className='flex items-center gap-2'>
										<Image
											src={uItem.imageUrl ?? ''}
											className='w-[60px] rounded'
										/>
										<Text className='text-sm font-medium'>{uItem.name}</Text>
									</View>
									<View onClick={() => removeUnavailableItem(uItem)}>
										<Text className='text-sm text-red-600 font-medium'>{t('checkoutReview.txtDelete')}</Text>
									</View>
								</View>
							))}
						</View>
					)}

					<View className='flex flex-col gap-4'>
						<CartSummary />

						{cart && <UserData />}

						{unavailableItems.length === 0 && (
							<>
								<DeliveryData />

								<SelectedPaymentData onPress={() => navigate('PaymentData', {}, true)} />
							</>
						)}
					</View>
				</>
			</View>

			{error.message && (
				<View className='fixed bottom-[90px] left-0 w-full'>
					<View className='p-4 bg-red-50 border border-red-200 rounded'>
						<Text className='text-sm text-red-600 font-medium'>
							{error.message || 'Houve um erro ao fechar o pedido'}
						</Text>
					</View>
					<BottomInset />
				</View>
			)}

			{/* Botão fixo na parte de baixo */}
			<View>
				<View className='fixed bottom-0 left-0 w-full z-10 bg-white border-t border-gray-300'>
					<View className='p-4'>
						<CustomButton
							disabled={!isReadyToPay()}
							label={t('finishCart.labelButton')}
							onPress={runPaymentScript}
						/>
					</View>
					<BottomInset />
				</View>

				<View className='h-[75px] w-full' />
			</View>

			{recaptchaSiteKey && (
				<Recaptcha
					ref={recaptchaRef}
					siteKey={recaptchaSiteKey}
				/>
			)}

			<OtpLogin
				open={showOtpLogin}
				onClose={() => setShowOtpLogin(false)}
				onLogged={handleLogged}
			/>

			<BottomInset />
		</Page>
	)
}
