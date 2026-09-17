import Eitri from 'eitri-bifrost'
import { useEffect, useState } from 'react'
import { useLocalShoppingCart } from '../providers/LocalCart'
import { Image, Page, Text, View } from 'eitri-luminus'
import { formatAmountInCents } from '../utils/utils'
import { clearCart, getPixStatus } from '../services/cartService'
import {
	HeaderContentWrapper,
	HeaderReturn,
	HeaderText,
	CustomButton,
	CustomInput,
	BottomInset,
	TrackingService
} from 'eitri-shopping-template-vtex-deco-shared'
import { navigate } from '../services/navigationService'
import { useSnackBar } from '../providers/SnackBar'
import { useTranslation } from 'eitri-i18n'

export default function PixOrder(props) {
	const [timeOut, setTimeOut] = useState(10 * 60)
	const [pixPayload, setPixPayload] = useState(null)
	const [showQRCode, setShowQRCode] = useState(false)

	let isMounted = true

	const { cart } = useLocalShoppingCart()
	const { showSnackBar } = useSnackBar()
	const { t } = useTranslation()

	const orderId = useRef(null)

	// `cart.value` is the raw order total — it doesn't account for gift cards
	// that may have already reduced what's actually being charged via Pix.
	// `paymentData.payments` reflects the real remainder.
	const pixPaymentValue = cart?.paymentData?.payments?.length
		? cart.paymentData.payments.reduce((acc, payment) => acc + (payment.value || 0), 0)
		: cart?.value

	useEffect(() => {
		TrackingService.sendScreenView('Aguardando pagamento Pix', 'PixOrder')
	}, [])

	useEffect(() => {
		const result = props.location?.state?.paymentResult

		if (result) {
			const appPayload = parseResponse(result?.paymentAuthorizationAppCollection?.[0]?.appPayload)

			orderId.current = result?.orderId

			setPixPayload(appPayload)

			checkPixStatus(appPayload.transactionId, appPayload.paymentId)

			const interval = setInterval(() => {
				setTimeOut(prev => prev - 1)
			}, 1000)

			return () => {
				isMounted = false
				clearInterval(interval)
			}
		}
	}, [props.location?.state?.paymentResult])

	useEffect(() => {
		if (timeOut <= 0) {
			Eitri.navigation.back()
		}
	}, [timeOut])

	function parseResponse(str) {
		try {
			// tenta parsear como JSON válido
			return JSON.parse(str)
		} catch (e) {
			// se falhar, extrai manualmente os campos que você precisa
			const codeMatch = str.match(/code:([^,}]*)/)
			const qrCodeMatch = str.match(/qrCodeBase64Image:([^,}]*)/)
			const paymentId = str.match(/paymentId:([^,}]*)/)
			const transactionId = str.match(/transactionId:([^,}]*)/)

			return {
				code: codeMatch ? codeMatch[1] : null,
				qrCodeBase64Image: qrCodeMatch ? qrCodeMatch[1] : null,
				paymentId,
				transactionId
			}
		}
	}

	const copyCode = async () => {
		Eitri.clipboard.setText({
			text: pixPayload.code
		})
		showSnackBar('success', t('pixOrder.snackCopied'))
	}

	const shareCode = async () => {
		await Eitri.share.link({
			url: `${pixPayload.code}`
		})
	}

	const toggleQRCode = () => {
		setShowQRCode(!showQRCode)
	}

	const formatTime = seconds => {
		let minutes = Math.floor(seconds / 60)
		let remainingSeconds = seconds % 60
		return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
	}

	async function checkPixStatus(transactionId, paymentId) {
		try {
			if (!isMounted) return
			const result = await getPixStatus(transactionId, paymentId)
			if (!result) return
			if (result.status === 'waiting') {
				await new Promise(resolve => setTimeout(resolve, 4000))
				await checkPixStatus(transactionId, paymentId)
			} else {
				clearCart()
				navigate('OrderCompleted', { orderId: orderId.current })
			}
		} catch (error) {}
	}

	// Call the function to start fetching data

	if (!pixPayload) return null

	return (
		<Page title='Aguardando pagamento Pix'>
			<HeaderContentWrapper>
				<HeaderReturn />
				<HeaderText text={t('pixOrder.txtHeader')} />
			</HeaderContentWrapper>

			<View className='p-4 flex flex-col gap-4'>
				{/* Informação sobre PIX */}
				<View className='flex items-center gap-3 bg-white p-4'>
					<View className='text-primary'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='16'
							height='16'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'>
							<circle
								cx='12'
								cy='12'
								r='10'></circle>
							<polyline points='12 6 12 12 16 14'></polyline>
						</svg>
					</View>
					<Text className='text-base-content/70 font-medium'>{t('pixOrder.txtPixApproved')}</Text>
				</View>

				{/* Valor do pagamento */}
				<View className='bg-white p-4'>
					<Text className='text-base-content/70'>
						{t('pixOrder.txtOrderValue')}{' '}
						<Text className='font-bold'>{formatAmountInCents(pixPaymentValue)}</Text>
					</Text>
				</View>

				{/* Código PIX */}
				<View className='bg-white p-4'>
					<Text className='text-base font-semibold mb-3 text-base-content'>{t('pixOrder.txtPixCode')}</Text>
					<CustomInput
						value={pixPayload.code}
						disabled
						className='w-full bg-base-100 border-base-300 mt-2'
					/>
				</View>

				<View className='flex flex-col gap-2'>
					{/* Botões de ação */}
					<View className='flex flex-row gap-2'>
						<CustomButton
							label={t('pixOrder.labelCopyCode')}
							className='flex-1'
							onPress={copyCode}
						/>
						<CustomButton
							label={t('pixOrder.labelShare')}
							className='flex-1'
							onPress={shareCode}
						/>
					</View>

					{/* Botão para mostrar/ocultar QR Code */}
					<CustomButton
						label={showQRCode ? t('pixOrder.labelHideQRCode') : t('pixOrder.labelShowQRCode')}
						className='w-full'
						onPress={toggleQRCode}
					/>
				</View>

				{/* QR Code */}
				{showQRCode && (
					<View className='flex items-center justify-center gap-4'>
						<View className='bg-white p-4 shadow-lg'>
							<Image
								src={`data:image;base64,${pixPayload.qrCodeBase64Image}`}
								className='w-48 h-48'
							/>
						</View>
					</View>
				)}

				{/* Instruções */}
				<View className='bg-white p-4'>
					<Text className='text-lg font-bold mb-3 text-base-content'>{t('pixOrder.txtHowToPay')}</Text>
					<View className='flex flex-col gap-2 mt-2'>
						<View className='flex flex-row items-center'>
							<Text className='text-base-content/70'>• {t('pixOrder.txtHowStep1')}</Text>
						</View>
						<View className='flex flex-row items-center'>
							<Text className='text-base-content/70'>• {t('pixOrder.txtHowStep2')}</Text>
						</View>
						<View className='flex flex-row items-center'>
							<Text className='text-base-content/70'>• {t('pixOrder.txtHowStep3')}</Text>
						</View>
					</View>
				</View>

				{/* Timer */}
				<View className='flex items-center justify-center'>
					<Text className='text-base-content/70 text-sm text-center'>
						{t('pixOrder.txtTimeRemaining')}: <Text className='font-semibold'>{formatTime(timeOut)}</Text>
					</Text>
				</View>

				{/* Informações adicionais */}
				<View className='px-4'>
					<Text className='block text-sm text-base-content/70 text-center'>
						{t('pixOrder.txtProcessing')}
					</Text>
				</View>
			</View>

			<BottomInset />
		</Page>
	)
}
