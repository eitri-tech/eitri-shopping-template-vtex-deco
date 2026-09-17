// /Users/calindra/Workspace/Eitri/eitri-shopping-template/shopping-vtex-template-account/src/views/PasswordResetNewPass.jsx
import {
	Loading,
	HeaderContentWrapper,
	HeaderReturn,
	HeaderText,
	CustomButton,
	CustomInput
} from 'eitri-shopping-monte-carlo-shared'
import Alert from '../components/Alert/Alert'
import { navigate, PAGES } from '../services/NavigationService'
import { useTranslation } from 'eitri-i18n'
import { setPassword } from '../services/CustomerService'
import { sendScreenView } from '../services/TrackingService'
import { addonUserTappedActiveTabListener } from '../utils/backToTopListener'

export default function PasswordResetNewPass(props) {
	const PAGE = 'Reset de senha - nova senha'
	const email = props?.location?.state?.email
	const recoveryCode = props?.location?.state?.recoveryCode

	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [showErrorAlert, setShowErrorAlert] = useState(false)

	const { t } = useTranslation()

	const requirements = [
		{
			text: t('passwordResetNewPass.passwordRequirementsCharacters'),
			valid: newPassword.length >= 8
		},
		{
			text: t('passwordResetNewPass.passwordRequirementsNumber'),
			valid: /[0-9]/.test(newPassword)
		},
		{
			text: t('passwordResetNewPass.passwordRequirementsUppercase'),
			valid: /[A-Z]/.test(newPassword)
		},
		{
			text: t('passwordResetNewPass.passwordRequirementsLowercase'),
			valid: /[a-z]/.test(newPassword)
		}
	]

	useEffect(() => {
		addonUserTappedActiveTabListener()
		sendScreenView('Reset de senha - nova senha', 'PasswordResetNewPass')
	}, [])

	const confirmNewPassword = async () => {
		try {
			if (!email || !recoveryCode || !newPassword) {
				return
			}
			setLoading(true)
			await setPassword(email, recoveryCode, newPassword)
			navigate(PAGES.HOME, {}, true)
			setLoading(false)
		} catch (e) {
			console.error(e)
			// logError(PAGE, 'Erro ao redefinir senha', e) // logError não está definido no escopo
			setShowErrorAlert(true)
			setLoading(false)
		}
	}

	const allRequirementsMet = requirements.every(req => req.valid)
	const passwordsMatch = newPassword && newPassword === confirmPassword

	return (
		<Page title={PAGE}>
			<HeaderContentWrapper>
				<HeaderReturn />
				<HeaderText text={t('passwordResetNewPass.headerText')} />
			</HeaderContentWrapper>

			<Loading
				isLoading={loading}
				fullScreen={true}
			/>

			<View className='p-4'>
				<View className='flex flex-col gap-2'>
					<Text className='w-full font-bold text-xl'>{t('passwordResetNewPass.forgotPass')}</Text>
				</View>

				<View className='mt-4 flex flex-col gap-2'>
					<CustomInput
						autoFocus
						type='password'
						label={t('passwordResetNewPass.newPass')}
						value={newPassword}
						onChange={e => setNewPassword(e.target.value)}
					/>
					<CustomInput
						type='password'
						label={t('passwordResetNewPass.confirmPass')}
						value={confirmPassword}
						onChange={e => setConfirmPassword(e.target.value)}
					/>
				</View>

				<View className='mt-4'>
					<View className='flex flex-col gap-1'>
						{requirements.map(req => (
							<View
								key={req.text}
								className={`flex items-center gap-2 transition-colors duration-300 ${
									req.valid ? 'text-green-600' : 'text-red-600'
								}`}>
								{req.valid ? (
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-4 w-4 stroke-current'
										fill='none'
										viewBox='0 0 24 24'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth='2'
											d='M5 13l4 4L19 7'
										/>
									</svg>
								) : (
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-4 w-4 stroke-current'
										fill='none'
										viewBox='0 0 24 24'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth='2'
											d='M6 18L18 6M6 6l12 12'
										/>
									</svg>
								)}
								<Text className='text-sm'>{req.text}</Text>
							</View>
						))}
					</View>
				</View>

				<View className='mt-6'>
					<CustomButton
						disabled={!allRequirementsMet || !passwordsMatch || loading}
						label={t('passwordResetNewPass.sendButton')}
						onPress={confirmNewPassword}
					/>
				</View>
			</View>

			<Alert
				type='negative'
				show={showErrorAlert}
				onDismiss={() => setShowErrorAlert(false)}
				duration={7}
				message={t('passwordResetNewPass.messageError')}
			/>
		</Page>
	)
}
