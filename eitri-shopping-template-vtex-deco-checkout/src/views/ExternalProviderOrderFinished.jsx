import Eitri from 'eitri-bifrost'
import { HeaderContentWrapper, CustomButton, TrackingService } from 'eitri-shopping-template-vtex-deco-shared'
import { openAccount } from '../services/navigationService'
import { useEffect } from 'react'

export default function ExternalProviderOrderFinished(props) {
	const PAGE = 'External Provider Order Finished'

	useEffect(() => {
		TrackingService.sendScreenView('Pagamento externo concluído', 'ExternalProviderOrderFinished')
	}, [])

	return (
		<Page title='Pagamento externo concluído'>
			<HeaderContentWrapper />
			<View className='p-4 flex flex-col items-center mt-6'>
				<View className='w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8'>
					<View className='w-16 h-16 bg-green-500 rounded-full flex items-center justify-center'>
						<Text className='text-white text-3xl font-bold'>✓</Text>
					</View>
				</View>

				<View className='bg-white rounded shadow-sm border border-gray-300 p-4'>
					<View className='mb-6 flex flex-col items-center'>
						<Text className='text-2xl w-full font-bold text-center text-gray-800 mb-2'>
							Solicitação enviada!
						</Text>
						<Text className='text-base text-center text-gray-600 leading-relaxed'>
							Acompanhe seu pedido em "Meus pedidos". Se houve algum problema no pagamento, é só clicar em
							"Tentar novamente"!
						</Text>
					</View>

					{/* Action Buttons */}
					<View className='flex flex-col gap-4'>
						<CustomButton
							label={'Ver meus pedidos'}
							onPress={openAccount}
							block
						/>
						<CustomButton
							outlined
							label={'Tentar novamente'}
							onPress={Eitri.navigation.back}
						/>
					</View>
				</View>
			</View>
		</Page>
	)
}
