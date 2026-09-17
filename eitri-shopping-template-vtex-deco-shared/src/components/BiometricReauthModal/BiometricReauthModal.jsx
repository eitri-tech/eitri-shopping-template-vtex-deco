import { useState } from 'react'
import CustomButton from '../CustomButton/CustomButton'
import CustomInput from '../CustomInput/CustomInput'
import { View, Text } from 'eitri-luminus'

export default function BiometricReauthModal(props) {
	const { show, email, onConfirm, onDismiss } = props

	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	if (!show) return null

	const reset = () => {
		setPassword('')
		setError('')
		setLoading(false)
	}

	const handleConfirm = async () => {
		if (!password) return
		setLoading(true)
		setError('')
		const success = await onConfirm(password)
		setLoading(false)
		if (success) {
			reset()
		} else {
			setError('Senha incorreta. Tente novamente.')
		}
	}

	const handleDismiss = () => {
		reset()
		onDismiss()
	}

	return (
		<View
			className='z-[9999] !bg-black/70 !opacity-100 fixed inset-0 flex items-center justify-center'
			onClick={handleDismiss}>
			<View
				className='flex flex-col p-4 bg-base-100 items-center rounded w-11/12 max-w-xs mx-auto'
				onClick={e => e.stopPropagation()}>
				<Text className='text-center text-lg font-bold mb-2 text-base-content'>Confirme sua senha</Text>
				<Text className='text-center text-sm mb-4 text-base-content'>
					Sua senha pode ter mudado. Digite a senha atual para continuar com a biometria.
				</Text>
				{email && <Text className='text-center text-sm font-medium mb-4 text-base-content'>{email}</Text>}
				<View className='w-full'>
					<CustomInput
						placeholder='Senha'
						type='password'
						value={password}
						error={error}
						onChange={e => setPassword(e.target.value)}
					/>
				</View>
				<View className='flex flex-col gap-3 w-full mt-4'>
					<CustomButton
						label='Entrar'
						disabled={loading}
						onPress={handleConfirm}
					/>
					<CustomButton
						variant='outlined'
						label='Agora não'
						disabled={loading}
						onPress={handleDismiss}
					/>
				</View>
			</View>
		</View>
	)
}
