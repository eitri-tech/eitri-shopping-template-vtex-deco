import Eitri from 'eitri-bifrost'
import { goHome, openAccount } from '../services/navigationService'
import { useTranslation } from 'eitri-i18n'
import { Page, Text, View } from 'eitri-luminus'
import {
	HeaderContentWrapper,
	HeaderReturn,
	HeaderText,
	CustomButton,
	BottomInset,
	TrackingService
} from 'eitri-shopping-template-vtex-deco-shared'

export default function OrderCompleted(props) {
	const orderId = props.location?.state?.orderId
	const { t } = useTranslation()

	useEffect(() => {
		requestAppReview()
		TrackingService.sendScreenView('Pedido realizado', 'OrderCompleted')
	}, [])

	const requestAppReview = async () => {
		try {
			await Eitri.appStore.requestInAppReview()
			console.log('Solicitação de avaliação enviada com sucesso!')
		} catch (error) {
			console.error('Erro ao solicitar avaliação do app:', error)
		}
	}

	return (
		<Page title='Pedido realizado'>
			<HeaderContentWrapper>
				<HeaderReturn />
				<HeaderText text={t('orderCompleted.titleHeader')} />
			</HeaderContentWrapper>

			<View className='p-4'>
				{/* Payment Confirmation Section */}
				<View className='bg-white rounded p-4'>
					<View className='flex flex-col items-center justify-center mb-4 gap-2'>
						<View className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center'>
							<Text className='text-2xl'>✓</Text>
						</View>
						<Text className='text-xl font-bold text-gray-800 text-center'>{t('orderCompleted.txtReady')}</Text>
					</View>

					<View className='flex flex-col items-center'>
						<Text className='text-gray-600 text-center text'>
							{t('orderCompleted.txtEmailConfirmation')}
						</Text>
					</View>

					<View className='flex flex-col items-center mt-4'>
						<Text className='text-gray-600 text-center text-sm'>{t('orderCompleted.txtOrderCode')}</Text>
						<Text className='text-gray-800 font-bold text-center text-lg'>{orderId}</Text>
					</View>
				</View>

				<View className='flex flex-col gap-4 mt-6'>
					<CustomButton
						label={t('orderCompleted.labelSeeOrders')}
						onClick={openAccount}
					/>
					<CustomButton
						outlined
						label={t('orderCompleted.labelBack')}
						onClick={goHome}
					/>
				</View>

				<BottomInset />
			</View>
		</Page>
	)
}
