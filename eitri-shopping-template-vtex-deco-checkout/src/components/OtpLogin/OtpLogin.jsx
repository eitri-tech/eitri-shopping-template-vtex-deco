import { View } from 'eitri-luminus'
import { useLocalShoppingCart } from '../../providers/LocalCart'
import { loginWithEmailAndKey, sendAccessKeyByEmail } from '../../services/CustomerService'
import { CustomButton, BottomInset, CustomInput, Loading } from 'eitri-shopping-template-vtex-deco-shared'
import { useTranslation } from 'eitri-i18n'

export default function OtpLogin(props) {
	const { open, onClose, onLogged } = props
	const { cart, startCart } = useLocalShoppingCart()
	const { t } = useTranslation()

	const [timeOutToResentEmail, setTimeOutToResentEmail] = useState(0)
	const [verificationCode, setVerificationCode] = useState('')
	const [loginError, setLoginError] = useState(false)
	const [loadingLogin, setLoadingLogin] = useState(false)

	const [email, setEmail] = useState('')

	useEffect(() => {
		if (!open) return
		sendOtpEmail(cart?.clientProfileData?.email)
		setEmail(cart?.clientProfileData?.email)
	}, [cart, open])

	const sendOtpEmail = async email => {
		try {
			if (!email) return
			if (timeOutToResentEmail > 0) {
				return
			}
			console.error('Enviando email:', email)
			await sendAccessKeyByEmail(email)
		} catch (e) {
			console.error('Erro ao enviar email:', e)
			setTimeOutToResentEmail(0)
		}
	}

	const loginWithEmailAndAccessKey = async () => {
		try {
			setLoadingLogin(true)
			const loggedIn = await loginWithEmailAndKey(email, verificationCode)
			if (loggedIn === 'Success') {
				await startCart()
				onLogged()
			} else {
				setLoginError(true)
			}
			setLoadingLogin(false)
		} catch (e) {
			setLoadingLogin(false)
			setLoginError(true)
			console.error('Erro ao fazer login com email e chave de acesso:', e)
		}
	}

	const maskEmailSimple = email => {
		if (!email) return ''
		const [local, domain] = email.split('@')
		if (!domain) return email
		if (local.length <= 2) return local[0] + '*@' + domain
		const masked = local[0] + '*'.repeat(local.length - 1)
		return `${masked}@${domain}`
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
				className='bg-white !rounded-t-sm w-screen max-h-[70vh] overflow-y-auto pointer-events-auto p-4'>
				<Text className='text-lg font-semibold'>
					{t('otpLogin.txtMessage', { email: maskEmailSimple(email) })}
				</Text>

				<View className='flex flex-col mt-6 gap-2'>
					<View>
						<CustomInput
							placeholder={t('otpLogin.placeholderCode')}
							inputMode='numeric'
							value={verificationCode}
							onChange={e => setVerificationCode(e.target.value)}
							height='45px'
						/>
						<View className='min-h-[20px]'>
							{loginError && <Text className='font-bold text-red-500 text-sm'>{t('otpLogin.errorInvalidCode')}</Text>}
						</View>
					</View>

					{loadingLogin ? (
						<View className='flex justify-center'>
							<Loading inline />
						</View>
					) : (
						<CustomButton
							disabled={!verificationCode}
							label={t('otpLogin.labelContinue')}
							onClick={loginWithEmailAndAccessKey}
						/>
					)}
				</View>

				<BottomInset />
			</View>
		</View>
	)
}
