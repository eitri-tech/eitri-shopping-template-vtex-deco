import { CustomButton } from 'eitri-shopping-template-vtex-deco-shared'
import { View, Text } from 'eitri-luminus'

export default function BiometricSaveModal(props) {
	const { show, onConfirm, onDismiss } = props

	if (!show) return null

	return (
		<View
			className='z-[9999] !bg-black/70 !opacity-100 fixed inset-0 flex items-center justify-center'
			onClick={onDismiss}>
			<View
				className='flex flex-col p-4 bg-base-100 items-center rounded w-11/12 max-w-xs mx-auto'
				onClick={e => e.stopPropagation()}>
				<Text className='text-center text-lg font-bold mb-2 text-base-content'>Login mais rápido</Text>
				<Text className='text-center text-sm mb-6 text-base-content'>
					Deseja salvar sua senha com biometria para entrar mais rápido nas próximas vezes?
				</Text>
				<View className='flex flex-col gap-3 w-full'>
					<CustomButton
						label='Salvar com biometria'
						onPress={onConfirm}
					/>
					<CustomButton
						variant='outlined'
						label='Agora não'
						onPress={onDismiss}
					/>
				</View>
			</View>
		</View>
	)
}
