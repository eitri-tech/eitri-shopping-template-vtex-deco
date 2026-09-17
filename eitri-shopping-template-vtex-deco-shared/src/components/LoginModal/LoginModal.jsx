import { View, Text } from 'eitri-luminus'
import BottomInset from '../BottomInset/BottomInset'
import CustomButton from '../CustomButton/CustomButton'
import CustomInput from '../CustomInput/CustomInput'

export default function LoginModal(props) {
	const {
		open,
		onClose,
		onLoginWithPassword,
		onRequestOtp,
		onLoginWithOtp,
		onRegisterClick,
		isLoading,
		initialMode = 'password'
	} = props

	const [mode, setMode] = useState(initialMode)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [otpCode, setOtpCode] = useState('')

	useEffect(() => {
		if (!open) return
		setMode(initialMode)
		setPassword('')
		setOtpCode('')
	}, [open, initialMode])

	const handlePasswordLogin = () => {
		if (typeof onLoginWithPassword === 'function') {
			onLoginWithPassword({ email, password })
		}
	}

	const handleRequestOtp = () => {
		if (typeof onRequestOtp === 'function') {
			onRequestOtp({ email })
		}
	}

	const handleOtpLogin = () => {
		if (typeof onLoginWithOtp === 'function') {
			onLoginWithOtp({ email, otpCode })
		}
	}

	if (!open) return null

	return (
		<View
			className='z-[9999] !bg-black/70 !opacity-100 fixed inset-0 flex items-end justify-center'
			onClick={() => {
				if (typeof onClose === 'function') onClose()
			}}>
			<View
				onClick={e => e.stopPropagation()}
				className='bg-white !rounded-t-sm w-screen max-h-[85vh] overflow-y-auto pointer-events-auto p-4'>
				<View className='flex flex-col gap-1 mb-4'>
					<Text className='text-lg font-bold text-base-content'>Entrar na conta</Text>
					<Text className='text-sm text-base-content/70'>
						Use seu e-mail e senha ou receba um código no email.
					</Text>
				</View>

				<View className='flex gap-2 mb-4'>
					<View
						onClick={() => setMode('password')}
						className={`flex-1 rounded border p-2 ${mode === 'password' ? 'border-primary bg-primary/10' : 'border-gray-300'}`}>
						<Text
							className={`text-center font-bold ${mode === 'password' ? 'text-primary' : 'text-base-content/70'}`}>
							Email e senha
						</Text>
					</View>
					<View
						onClick={() => setMode('otp')}
						className={`flex-1 rounded border p-2 ${mode === 'otp' ? 'border-primary bg-primary/10' : 'border-gray-300'}`}>
						<Text
							className={`text-center font-bold ${mode === 'otp' ? 'text-primary' : 'text-base-content/70'}`}>
							Código de acesso
						</Text>
					</View>
				</View>

				<View className='flex flex-col gap-3'>
					<CustomInput
						label='E-mail'
						placeholder='Digite seu e-mail'
						type='email'
						value={email}
						onChange={e => setEmail(e.target.value)}
					/>

					{mode === 'password' && (
						<>
							<CustomInput
								label='Senha'
								placeholder='Digite sua senha'
								type='password'
								value={password}
								onChange={e => setPassword(e.target.value)}
							/>
							<CustomButton
								label='Entrar'
								disabled={!email || !password || isLoading}
								isLoading={isLoading}
								onClick={handlePasswordLogin}
							/>
						</>
					)}

					{mode === 'otp' && (
						<>
							<CustomButton
								label='Enviar código'
								disabled={!email || isLoading}
								isLoading={isLoading}
								onClick={handleRequestOtp}
							/>
							<CustomInput
								label='Código OTP'
								placeholder='Digite o código recebido'
								inputMode='numeric'
								value={otpCode}
								onChange={e => setOtpCode(e.target.value)}
							/>
							<CustomButton
								label='Entrar com OTP'
								disabled={!email || !otpCode || isLoading}
								isLoading={isLoading}
								onClick={handleOtpLogin}
							/>
						</>
					)}
				</View>

				<View className='mt-5 flex items-center justify-center'>
					<View
						onClick={() => {
							if (typeof onRegisterClick === 'function') {
								onRegisterClick()
							}
						}}>
						<Text className='text-primary font-bold underline'>Ainda não tem conta? Cadastre-se</Text>
					</View>
				</View>

				<BottomInset />
			</View>
		</View>
	)
}
