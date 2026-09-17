import Eitri from 'eitri-bifrost'
import {
	CustomButton,
	CustomInput,
	HeaderText,
	HeaderContentWrapper,
	HeaderReturn,
	Loading,
	GenericBox
} from 'eitri-shopping-template-vtex-deco-shared'
import userIcon from '../assets/icons/user.svg'
import { sendScreenView } from '../services/TrackingService'
import { getCustomerData, getSavedUser, loginWithEmailAndKey, sendAccessKeyByEmail } from '../services/CustomerService'
import { navigate, PAGES } from '../services/NavigationService'
import { useTranslation } from 'eitri-i18n'
import Alert from '../components/Alert/Alert'
import { addonUserTappedActiveTabListener } from '../utils/backToTopListener'

export default function SignUp(props) {
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
				<HeaderReturn />
				<HeaderText text={t('signUp.lbRegister')} />
			</HeaderContentWrapper>

			<View className='p-4'>
				<GenericBox>
					<Text className='text-xl font-bold'>{t('signUp.lbEmailAccess')}</Text>

					{/* Container do formulário com espaçamento vertical consistente */}
					<View className='mt-4 flex flex-col gap-y-4'>
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
								<CustomInput
									label={t('signUp.lbVerifyCode')}
									placeholder={t('signUp.lbVerifyCode')}
									inputMode='numeric'
									value={verificationCode}
									onChange={e => setVerificationCode(e.target.value)}
									height='45px'
								/>

								<CustomButton
									label={t('signUp.lbLogin')}
									onPress={loginWithEmailAndAccessKey}
									disabled={!email || !verificationCode}
									type='email'
								/>
							</>
						)}

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

						<CustomButton
							variant='outlined'
							label={t('signUp.lbBack')}
							onPress={() => Eitri.navigation.back()}
						/>
					</View>
				</GenericBox>
			</View>

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
