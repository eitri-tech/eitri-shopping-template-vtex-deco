import Eitri from 'eitri-bifrost'
import { useEffect, useRef, useState } from 'react'
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
import type { RouteProps } from '../types/route'

// paymentResult comes from CheckoutReview's startPayment() call — same untyped Promise<unknown>
// boundary, narrowed here to the fields this view actually reads.
interface PixPaymentResult {
	orderId?: string
	paymentAuthorizationAppCollection?: Array<{ appPayload?: string; [key: string]: unknown }>
	[key: string]: unknown
}

interface PixOrderState {
	paymentResult?: PixPaymentResult
}

interface PixPayload {
	code?: string
	qrCodeBase64Image?: string
	paymentId?: string
	transactionId?: string
	[key: string]: unknown
}

export default function PixOrder(props: RouteProps<PixOrderState>) {
	const [timeOut, setTimeOut] = useState(10 * 60)
	const [pixPayload, setPixPayload] = useState<PixPayload | null>(null)
	const [showQRCode, setShowQRCode] = useState(false)

	let isMounted = true

	const { cart } = useLocalShoppingCart()
	const { showSnackBar } = useSnackBar()
	const { t } = useTranslation()

	const orderId = useRef<string | undefined>(undefined)

	useEffect(() => {
		TrackingService.sendScreenView('Aguardando pagamento Pix', 'PixOrder')
	}, [])

	useEffect(() => {
		const result = props.location?.state?.paymentResult

		if (result) {
			const appPayload = parseResponse(result?.paymentAuthorizationAppCollection?.[0]?.appPayload ?? '')

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.location?.state?.paymentResult])

	useEffect(() => {
		if (timeOut <= 0) {
			Eitri.navigation.back(1)
		}
	}, [timeOut])

	function parseResponse(str: string): PixPayload {
		try {
			// tenta parsear como JSON válido
			return JSON.parse(str)
		} catch (e) {
			// se falhar, extrai manualmente os campos que você precisa
			const codeMatch = str.match(/code:([^,}]*)/)
			const qrCodeMatch = str.match(/qrCodeBase64Image:([^,}]*)/)
			const paymentId = str.match(/paymentId:([^,}]*)/)
			const transactionId = str.match(/transactionId:([^,}]*)/)

			// BUG FOUND (pre-existing): unlike code/qrCodeBase64Image above, this fallback branch assigned
			// the whole RegExpMatchArray to paymentId/transactionId instead of the captured group ([1]) —
			// meaning a non-JSON appPayload always produced a non-string, malformed paymentId/transactionId.
			// Fixed here to read the captured group, matching the pattern used two lines above.
			return {
				code: codeMatch ? codeMatch[1] : undefined,
				qrCodeBase64Image: qrCodeMatch ? qrCodeMatch[1] : undefined,
				paymentId: paymentId ? paymentId[1] : undefined,
				transactionId: transactionId ? transactionId[1] : undefined
			}
		}
	}

	const copyCode = async () => {
		Eitri.clipboard.setText({
			text: pixPayload?.code ?? ''
		})
		showSnackBar?.('success', t('pixOrder.snackCopied'))
	}

	const shareCode = async () => {
		await Eitri.share.link({
			url: `${pixPayload?.code ?? ''}`
		})
	}

	const toggleQRCode = () => {
		setShowQRCode(!showQRCode)
	}

	const formatTime = (seconds: number): string => {
		const minutes = Math.floor(seconds / 60)
		const remainingSeconds = seconds % 60
		return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
	}

	async function checkPixStatus(transactionId?: string, paymentId?: string) {
		try {
			if (!isMounted || !transactionId || !paymentId) return
			const result = (await getPixStatus(transactionId, paymentId)) as { status?: string } | undefined
			if (!result) return
			if (result.status === 'waiting') {
				await new Promise(resolve => setTimeout(resolve, 4000))
				await checkPixStatus(transactionId, paymentId)
			} else {
				clearCart()
				navigate('OrderCompleted', { orderId: orderId.current })
			}
		} catch (error) {
			// ignore — polling continues on the next interval tick
		}
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
				<View className='flex items-center gap-3 bg-white rounded p-4'>
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
				<View className='bg-white rounded p-4'>
					<Text className='text-base-content/70'>
						{t('pixOrder.txtOrderValue')}{' '}
						<Text className='font-bold'>{formatAmountInCents(cart?.value)}</Text>
					</Text>
				</View>

				{/* Código PIX */}
				<View className='bg-white rounded p-4'>
					<Text className='text-base font-semibold mb-3 text-base-content'>{t('pixOrder.txtPixCode')}</Text>
					<CustomInput
						value={pixPayload.code ?? ''}
						disabled
						className='w-full rounded bg-base-100 border-base-300 mt-2'
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
						<View className='bg-white p-4 rounded shadow-lg'>
							<Image
								src={`data:image;base64,${pixPayload.qrCodeBase64Image ?? ''}`}
								className='w-48 h-48'
							/>
						</View>
					</View>
				)}

				{/* Instruções */}
				<View className='bg-white rounded p-4'>
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
