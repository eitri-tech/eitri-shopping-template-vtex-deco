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
	GenericBox,
	TrackingService
} from 'eitri-shopping-template-vtex-deco-shared'
import {
	doLogin,
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
import SocialLogin from '../components/SocialLogin/SocialLogin'
import { addonUserTappedActiveTabListener } from '../utils/backToTopListener'

export default function SignIn(props) {
	const { t } = useTranslation()

	const redirectTo = props?.location?.state?.redirectTo
	const closeAppAfterLogin = props?.location?.state?.closeAppAfterLogin

	const LOGIN_WITH_EMAIL_AND_PASSWORD = 'emailAndPassword'
	const LOGIN_WITH_EMAIL_AND_ACCESS_KEY = 'emailAndAccessKey'
	const TIME_TO_RESEND_EMAIL = 60

	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [showLoginErrorAlert, setShowLoginErrorAlert] = useState(false)
	const [alertMessage, setAlertMessage] = useState('')
	const [loginMode, setLoginMode] = useState(LOGIN_WITH_EMAIL_AND_PASSWORD)
	const [verificationCode, setVerificationCode] = useState('')
	const [emailCodeSent, setEmailCodeSent] = useState(false)
	const [timeOutToResentEmail, setTimeOutToResentEmail] = useState(0)
	const [loadingSendingCode, setLoadingSendingCode] = useState(false)
	const [loginProviders, setLoginProviders] = useState()
	const [loadingLoginProviders, setLoadingLoginProviders] = useState(false)
	const [canUseSocialLogin, setCanUseSocialLogin] = useState(false)

	useEffect(() => {
		loadLoginProviders()
		addonUserTappedActiveTabListener()
		sendScreenView('Login', 'SignIn')
	}, [])

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
			const { applicationData } = await Eitri.getConfigs()
			if (applicationData?.platform === 'android') {
				setCanUseSocialLogin(true)
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
			navigate('/' + redirectTo)
		} else if (closeAppAfterLogin) {
			Eitri.close()
		} else {
			Eitri.navigation.back()
		}
	}

	const handleLogin = async () => {
		setLoading(true)
		try {
			const loggedIn = await doLogin(username, password)
			if (loggedIn === 'Success') {
				await onLoggedIn()
				TrackingService.loginEvent('password')
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

	const handleSocialLogin = async () => {
		try {
			onLoggedIn()
		} catch (error) {
			console.log(error)
		}
	}

	const resendCode = timeOutToResentEmail > 0

	return (
		<Page title='Login' topInset>
			<HeaderContentWrapper>
				<HeaderReturn />
				<HeaderText text={t('signIn.headerText')} />
			</HeaderContentWrapper>

			<Loading
				isLoading={loadingLoginProviders || loading}
				fullScreen={true}
			/>

			<View className='p-4'>
				<View>
					<Text className='w-full font-bold text-xl'>{t('signIn.welcome')}</Text>
				</View>

				<GenericBox className='mt-4'>
					{loginMode === LOGIN_WITH_EMAIL_AND_PASSWORD && (
						<>
							<View>
								<CustomInput
									icon={userIcon}
									value={username}
									placeholder={t('signIn.formName')}
									inputMode='email'
									onChange={e => setUsername(e?.target?.value)}
								/>
							</View>

							<View className='mt-4'>
								<CustomInput
									placeholder={t('signIn.formPass')}
									icon={lockIcon}
									value={password}
									type='password'
									onChange={e => setPassword(e.target.value)}
								/>
							</View>

							<View className='mt-4'>
								<CustomButton
									width='100%'
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

							<View className='mt-8 flex justify-center'>
								<View onClick={goToPasswordReset}>
									<Text className='w-full text-primary'>{t('signIn.forgotPass')}</Text>
								</View>
							</View>

							<View className='mt-4 flex justify-center'>
								<View
									onClick={() => {
										navigate(PAGES.SIGNUP)
									}}>
									<Text className='w-full text-primary'>{t('signIn.noRegister')}</Text>
								</View>
							</View>
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
						</View>
					)}

					{Eitri.canIUse('23') &&
						canUseSocialLogin &&
						loginProviders?.oAuthProviders &&
						loginProviders?.oAuthProviders?.length > 0 && (
							<>
								<View className='mt-8 mb-8 flex w-full items-center gap-x-4'>
									<View className='h-px flex-1 bg-gray-300' />
									<Text className='flex-shrink-0 text-accent-100 font-medium'>Ou</Text>
									<View className='h-px flex-1 bg-gray-300' />
								</View>

								<SocialLogin
									oAuthProviders={loginProviders?.oAuthProviders}
									handleSocialLogin={handleSocialLogin}
								/>
							</>
						)}
				</GenericBox>
			</View>

			<Alert
				show={showLoginErrorAlert}
				onDismiss={() => setShowLoginErrorAlert(false)}
				duration={10}
				message={alertMessage}
			/>
		</Page>
	)
}
