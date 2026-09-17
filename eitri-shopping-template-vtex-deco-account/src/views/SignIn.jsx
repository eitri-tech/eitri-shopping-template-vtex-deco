import userIcon from '../assets/images/user.svg'
import lockIcon from '../assets/icons/lock.svg'
import Eitri from 'eitri-bifrost'
import {
	Loading,
	HeaderContentWrapper,
	HeaderText,
	CustomButton,
	CustomInput,
	HeaderReturn,
	TrackingService,
	BiometricService,
	useBiometricLogin,
	BiometricReauthModal
} from 'eitri-shopping-template-vtex-deco-shared'
import {
	doLogin,
	isLoggedIn,
	loadUserEmailFromStorage,
	loginWithEmailAndKey,
	saveUserEmailOnStorage,
	sendAccessKeyByEmail
} from '../services/CustomerService'
import Alert from '../components/Alert/Alert'
import { sendScreenView } from '../services/TrackingService'
import { navigate, PAGES } from '../services/NavigationService'
import { useTranslation } from 'eitri-i18n'
import { getLoginProviders } from '../services/StoreService'
import { addonUserTappedActiveTabListener } from '../utils/backToTopListener'
import HelpSection from '../components/HelpSection/HelpSection'
import BiometricSaveModal from '../components/BiometricSaveModal/BiometricSaveModal'

export default function SignIn(props) {
	const { t } = useTranslation()

	const redirectTo = props?.location?.state?.redirectTo
	const redirectState = props?.location?.state?.redirectState
	const closeAppAfterLogin = props?.location?.state?.closeAppAfterLogin

	const LOGIN_WITH_EMAIL_AND_PASSWORD = 'emailAndPassword'
	const LOGIN_WITH_EMAIL_AND_ACCESS_KEY = 'emailAndAccessKey'
	const TIME_TO_RESEND_EMAIL = 60

	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [showLoginErrorAlert, setShowLoginErrorAlert] = useState(false)
	const [alertMessage, setAlertMessage] = useState('')
	const initialLoginMode = props?.location?.state?.loginMode === LOGIN_WITH_EMAIL_AND_ACCESS_KEY
		? LOGIN_WITH_EMAIL_AND_ACCESS_KEY
		: LOGIN_WITH_EMAIL_AND_PASSWORD
	const [loginMode, setLoginMode] = useState(initialLoginMode)
	const [verificationCode, setVerificationCode] = useState('')
	const [emailCodeSent, setEmailCodeSent] = useState(false)
	const [timeOutToResentEmail, setTimeOutToResentEmail] = useState(0)
	const [loadingSendingCode, setLoadingSendingCode] = useState(false)
	const [loginProviders, setLoginProviders] = useState()
	const [loadingLoginProviders, setLoadingLoginProviders] = useState(false)
	const [showBiometricSaveModal, setShowBiometricSaveModal] = useState(false)

	const { attemptBiometricLogin, showReauthModal, reauthEmail, handleReauthConfirm, dismissReauthModal } =
		useBiometricLogin({
			doLogin,
			isLoggedIn: async () => false,
			onSuccess: () => onLoggedIn()
		})

	useEffect(() => {
		initialize()
		Eitri.navigation.setOnResumeListener(redirectLoggedUser)
	}, [])

	const initialize = async () => {
		if (await redirectLoggedUser()) return

		loadLoginProviders()
		attemptBiometricLogin()
		addonUserTappedActiveTabListener()
		sendScreenView('Login', 'SignIn')
	}

	const redirectLoggedUser = async () => {
		try {
			if (!(await isLoggedIn())) return false

			setLoading(true)
			await onLoggedIn()
			return true
		} catch (error) {
			console.error('Erro ao verificar sessão antes de exibir o login', error)
			return false
		}
	}

	useEffect(() => {
		loadUserEmailFromStorage()
			.then(email => {
				if (email) {
					setUsername(email)
				}
			})
			.catch()
	}, [])

	useEffect(() => {
		if (timeOutToResentEmail > 0) {
			setTimeout(() => {
				setTimeOutToResentEmail(prevState => prevState - 1)
			}, 1000)
		}
	}, [timeOutToResentEmail])

	const loadLoginProviders = async () => {
		try {
			setLoadingLoginProviders(true)
			const providers = await getLoginProviders()
			if (!providers?.passwordAuthentication && providers?.accessKeyAuthentication) {
				setLoginMode(LOGIN_WITH_EMAIL_AND_ACCESS_KEY)
			}
			setLoginProviders(providers)
			setLoadingLoginProviders(false)
		} catch (e) {
			console.error('Erro ao carregar provedores de login', e)
			setLoadingLoginProviders(false)
		}
	}

	const goToPasswordReset = () => {
		navigate(PAGES.PASSWORD_RESET, { email: username })
	}

	const setLoginMethod = method => {
		setLoginMode(method)
	}

	const sendAccessKey = async () => {
		try {
			if (timeOutToResentEmail > 0) {
				return
			}
			setLoadingSendingCode(true)
			await sendAccessKeyByEmail(username)
			setEmailCodeSent(true)
			setTimeOutToResentEmail(TIME_TO_RESEND_EMAIL)
			setLoadingSendingCode(false)
		} catch (e) {
			setAlertMessage(t('signIn.errorSendAccess'))
			setShowLoginErrorAlert(true)
			setEmailCodeSent(false)
			setTimeOutToResentEmail(0)
			setLoadingSendingCode(false)
		} finally {
			saveUserEmailOnStorage(username)
		}
	}

	const onLoggedIn = () => {
		if (redirectTo) {
			const path = redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`
			return navigate(path, redirectState, true)
		} else if (closeAppAfterLogin) {
			return Eitri.close()
		} else {
			return Eitri.navigation.navigate({ path: PAGES.HOME, reset: true })
		}
	}

	const handleLogin = async () => {
		setLoading(true)
		try {
			const loggedIn = await doLogin(username, password)
			if (loggedIn === 'Success') {
				TrackingService.loginEvent('password')
				const canOfferBiometricSave =
					(await BiometricService.isBiometricAvailable()) && !(await BiometricService.hasSavedCredentials())
				if (canOfferBiometricSave) {
					setLoading(false)
					setShowBiometricSaveModal(true)
					return
				}
				await onLoggedIn()
				return
			}
			setAlertMessage(t('signIn.verifyAgain'))
			setShowLoginErrorAlert(true)
		} catch (e) {
			setAlertMessage(t('signIn.errorInvalidUser'))
			setShowLoginErrorAlert(true)
		} finally {
			saveUserEmailOnStorage(username)
		}

		setLoading(false)
	}

	const handleConfirmBiometricSave = async () => {
		setShowBiometricSaveModal(false)
		setLoading(true)
		await BiometricService.saveCredentialsWithBiometrics(username, password)
		setLoading(false)
		await onLoggedIn()
	}

	const handleDismissBiometricSave = async () => {
		setShowBiometricSaveModal(false)
		await onLoggedIn()
	}

	const loginWithEmailAndAccessKey = async () => {
		setLoading(true)
		try {
			const loggedIn = await loginWithEmailAndKey(username, verificationCode)
			if (loggedIn === 'Success') {
				await onLoggedIn()
				TrackingService.loginEvent('otp')
				return
			}
			setAlertMessage(t('signIn.wrongCredentials'))
			setShowLoginErrorAlert(true)
		} catch (e) {
			setAlertMessage(t('signIn.wrongCredentials'))
			setShowLoginErrorAlert(true)
		} finally {
			saveUserEmailOnStorage(username)
		}

		setLoading(false)
	}

	const resendCode = timeOutToResentEmail > 0

	const registerLink = (
		<View className='mt-5 flex flex-col items-start'>
			<Text className='text-sm text-accent-100'>{t('signIn.noAccountYet')}</Text>
			<View
				className='mt-1'
				onClick={() => navigate(PAGES.SIGNUP)}>
				<Text className='text-sm text-primary underline'>{t('signIn.registerNow')}</Text>
			</View>
		</View>
	)

	return (
		<Page
			title='Login'
			topInset>
			<HeaderContentWrapper containerClassName='shadow-none'>
				<HeaderReturn />
				<View className='absolute left-0 right-0 flex justify-center pointer-events-none'>
					<HeaderText text='Entrar com email e senha' />
				</View>
			</HeaderContentWrapper>

			<Loading
				isLoading={loadingLoginProviders || loading}
				fullScreen={true}
			/>

			<View className='px-8'>
				<View className='mb-6 flex justify-center'>
					<Text className='w-full text-center text-sm text-gray-700'>
						{t('signIn.emailPasswordSubtitle')}
					</Text>
				</View>

				<View>
					{loginMode === LOGIN_WITH_EMAIL_AND_PASSWORD && (
						<>
							<View>
								<CustomInput
									icon={userIcon}
									label={t('signIn.formEmail')}
									value={username}
									placeholder={t('signIn.formName')}
									inputMode='email'
									onChange={e => setUsername(e?.target?.value)}
								/>
							</View>

							<View className='mt-4'>
								<CustomInput
									label={t('signIn.formPass')}
									placeholder={t('signIn.formPass')}
									icon={lockIcon}
									value={password}
									type='password'
									onChange={e => setPassword(e.target.value)}
								/>
							</View>

							<View className='mt-2 flex justify-start'>
								<View onClick={goToPasswordReset}>
									<Text className='text-primary underline'>{t('signIn.forgotPass')}</Text>
								</View>
							</View>

							<View className='mt-4'>
								<CustomButton
									width='100%'
									height='h-[40px]'
									label={t('signIn.labelButton')}
									onPress={handleLogin}
								/>
							</View>

							<View className='mt-4'>
								<CustomButton
									width='100%'
									variant='outlined'
									label={t('signIn.labelAccessWithCode')}
									onPress={() => setLoginMethod(LOGIN_WITH_EMAIL_AND_ACCESS_KEY)}
								/>
							</View>

							{registerLink}
						</>
					)}

					{loginMode === LOGIN_WITH_EMAIL_AND_ACCESS_KEY && (
						<View>
							<CustomInput
								icon={userIcon}
								value={username}
								inputMode='email'
								placeholder={t('signIn.formEmail')}
								onChange={e => {
									setUsername(e.target.value)
								}}
							/>

							{emailCodeSent && (
								<>
									<View className='mt-4'>
										<CustomInput
											label={t('signIn.formCodeVerification')}
											placeholder={t('signIn.formCodeVerification')}
											inputMode='numeric'
											value={verificationCode}
											onChange={e => setVerificationCode(e.target.value)}
											height='45px'
										/>
									</View>

									<View className='mt-4'>
										<CustomButton
											label={t('signIn.labelButton')}
											onPress={loginWithEmailAndAccessKey}
											disabled={!username || !verificationCode}
										/>
									</View>
								</>
							)}

							<View className='mt-4'>
								<CustomButton
									label={
										!emailCodeSent
											? t('signIn.textSendCode')
											: `${t('signIn.textResendCode')}${
													resendCode ? ` (${timeOutToResentEmail})` : ''
												}`
									}
									disabled={resendCode || !username || loadingSendingCode}
									onPress={sendAccessKey}
								/>
							</View>

							{loginProviders?.passwordAuthentication && (
								<View className='mt-4'>
									<CustomButton
										variant='outlined'
										label={t('signIn.labelLoginWithPass')}
										onPress={() => setLoginMethod(LOGIN_WITH_EMAIL_AND_PASSWORD)}
									/>
								</View>
							)}

							{registerLink}
						</View>
					)}
				</View>
			</View>

			<HelpSection
				className='mt-14'
				hideTopDivisor
				showItemDivisors
			/>

			<BiometricReauthModal
				show={showReauthModal}
				email={reauthEmail}
				onConfirm={handleReauthConfirm}
				onDismiss={dismissReauthModal}
			/>

		<BiometricSaveModal
			show={showBiometricSaveModal}
			onConfirm={handleConfirmBiometricSave}
			onDismiss={handleDismissBiometricSave}
		/>

			<Alert
				show={showLoginErrorAlert}
				onDismiss={() => setShowLoginErrorAlert(false)}
				duration={10}
				message={alertMessage}
			/>
		</Page>
	)
}
