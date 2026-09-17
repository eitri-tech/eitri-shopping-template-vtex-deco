import Eitri from 'eitri-bifrost'
import {
	CustomButton,
	CustomInput,
	HeaderText,
	HeaderContentWrapper,
	HeaderReturn,
	Loading
} from 'eitri-shopping-template-vtex-deco-shared'
import userIcon from '../assets/icons/user.svg'
import { sendScreenView } from '../services/TrackingService'
import { TrackingService } from 'eitri-shopping-template-vtex-deco-shared'
import { getSavedUser, loginWithEmailAndKey, sendAccessKeyByEmail } from '../services/CustomerService'
import { navigate, PAGES } from '../services/NavigationService'
import { useTranslation } from 'eitri-i18n'
import Alert from '../components/Alert/Alert'
import { addonUserTappedActiveTabListener } from '../utils/backToTopListener'
import HelpSection from '../components/HelpSection/HelpSection'

export default function SignUp(props) {
	const fromWelcome = props?.location?.state?.fromWelcome
	const [email, setEmail] = useState('')
	const [loading, setLoading] = useState(false)
	const [showLoginErrorAlert, setShowLoginErrorAlert] = useState(false)
	const [alertMessage, setAlertMessage] = useState('')
	const [verificationCode, setVerificationCode] = useState('')
	const [emailCodeSent, setEmailCodeSent] = useState(false)
	const [timeOutToResentEmail, setTimeOutToResentEmail] = useState(0)
	const [loadingSendingCode, setLoadingSendingCode] = useState(false)

	const TIME_TO_RESEND_EMAIL = 60
	const resendCode = timeOutToResentEmail > 0

	const { t } = useTranslation()

	useEffect(() => {
		const loadSavedUser = async () => {
			const user = await getSavedUser()
			if (user && user.email) {
				setEmail(user.email)
			}
		}

		loadSavedUser()
		addonUserTappedActiveTabListener()
		sendScreenView('Cadastro', 'SignUp')
	}, [])

	useEffect(() => {
		if (timeOutToResentEmail > 0) {
			setTimeout(() => {
				setTimeOutToResentEmail(prevState => prevState - 1)
			}, 1000)
		}
	}, [timeOutToResentEmail])

	const sendAccessKey = async () => {
		try {
			if (timeOutToResentEmail > 0) return

			setLoadingSendingCode(true)
			await sendAccessKeyByEmail(email)
			setEmailCodeSent(true)
			setTimeOutToResentEmail(TIME_TO_RESEND_EMAIL)
		} catch (e) {
			setAlertMessage(t('signUp.alertMessageSendEmailError'))
			setShowLoginErrorAlert(true)
			setEmailCodeSent(false)
			setTimeOutToResentEmail(0)
		} finally {
			setLoadingSendingCode(false)
		}
	}

	const loginWithEmailAndAccessKey = async () => {
		setLoading(true)
		try {
			const loggedIn = await loginWithEmailAndKey(email, verificationCode)
			if (loggedIn === 'Success') {
				if (fromWelcome) {
					Eitri.nativeNavigation.open({ slug: 'home' })
					return
				}
				navigate(PAGES.EDIT_PROFILE)
			} else {
				setAlertMessage(t('signUp.alertMessageVerify'))
				setShowLoginErrorAlert(true)
			}
		} catch (e) {
			const status = e?.response?.status || 400
			if (status >= 500) {
				setAlertMessage(t('signUp.alertMessageServiceError'))
			} else {
				setAlertMessage(t('signUp.alertMessageVerify'))
			}
			setShowLoginErrorAlert(true)
		} finally {
			setLoading(false)
		}
	}

	return (
		<Page title='Cadastro' topInset>
			<Loading
				isLoading={loading}
				fullScreen={true}
			/>

			<HeaderContentWrapper>
				<HeaderReturn onClick={() => {
				if (fromWelcome) {
					TrackingService.selectContentEvent({ content_type: 'welcome_modal', content_id: 'back_from_sign_up' })
				}
				Eitri.navigation.back()
			}} />
				<HeaderText text={t('signUp.lbRegister')} />
			</HeaderContentWrapper>

			<View className='p-4'>
				<View className='mb-4'>
					<Text className='w-full text-gray-600'>{t('signUp.lbEmailAccess')}</Text>
				</View>

				<View>
					<CustomInput
						icon={userIcon}
						value={email}
						type='email'
						placeholder='Email'
						onChange={e => setEmail(e.target.value)}
						showClearInput={false}
						required={true}
					/>

					{emailCodeSent && (
						<>
							<View className='mt-4'>
								<CustomInput
									label={t('signUp.lbVerifyCode')}
									placeholder={t('signUp.lbVerifyCode')}
									inputMode='numeric'
									value={verificationCode}
									onChange={e => setVerificationCode(e.target.value)}
									height='45px'
								/>
							</View>

							<View className='mt-4'>
								<CustomButton
									label={t('signUp.lbLogin')}
									onPress={loginWithEmailAndAccessKey}
									disabled={!email || !verificationCode}
									type='email'
								/>
							</View>
						</>
					)}

					<View className='mt-4'>
						<CustomButton
							width='100%'
							label={
								!emailCodeSent
									? t('signIn.textSendCode')
									: `${t('signIn.textResendCode')}${resendCode ? ` (${timeOutToResentEmail})` : ''}`
							}
							disabled={resendCode || !email || loadingSendingCode}
							onPress={sendAccessKey}
						/>
					</View>

					<View className='mt-4 flex justify-center'>
						<View onClick={() => navigate(PAGES.AUTH_SELECT)}>
							<Text className='w-full text-primary'>{t('signUp.alreadyHaveAccount')}</Text>
						</View>
					</View>
				</View>
			</View>

			<HelpSection />

			<Alert
				type='negative'
				show={showLoginErrorAlert}
				onDismiss={() => setShowLoginErrorAlert(false)}
				duration={7}
				message={alertMessage}
			/>
		</Page>
	)
}
