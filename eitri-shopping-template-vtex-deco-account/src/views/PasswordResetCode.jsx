import {
	HeaderContentWrapper,
	HeaderReturn,
	HeaderText,
	CustomButton,
	CustomInput
} from 'eitri-shopping-template-vtex-deco-shared'
import { navigate, PAGES } from '../services/NavigationService'
import { useTranslation } from 'eitri-i18n'
import { sendScreenView } from '../services/TrackingService'
import { addonUserTappedActiveTabListener } from '../utils/backToTopListener'

export default function PasswordResetCode(props) {
	const [recoveryCode, setRecoveryCode] = useState('')

	const RECOVERY_CODE_LENGTH = 6

	const email = props?.location?.state?.email

	const { t } = useTranslation()

	useEffect(() => {
		addonUserTappedActiveTabListener()
		sendScreenView('Reset de senha - código', 'PasswordResetCode')
	}, [])

	const goToPasswordNewPass = () => {
		if (recoveryCode.length !== RECOVERY_CODE_LENGTH) {
			return
		}
		navigate(PAGES.PASSWORD_RESET_NEW_PASS, { email: email, recoveryCode })
	}

	const onCodeFilled = e => {
		setRecoveryCode(e.target.value)
	}

	return (
		<Page topInset>
			<HeaderContentWrapper>
				<HeaderReturn />
				<HeaderText text={t('passwordResetCode.headerText')} />
			</HeaderContentWrapper>

			<View className='p-4 flex flex-col w-full'>
				<View className='flex flex-col gap-2'>
					<Text className='w-full font-bold text-xl'>{t('passwordResetCode.forgotPass')}</Text>
					<Text className='text text-gray-600'>
						{t('passwordResetCode.messageEmail')}
						<Text className='font-bold text-gray-700 ml-1'>{email}</Text>
					</Text>
				</View>

				<View className='mt-4 flex gap-1 justify-between w-full'>
					<CustomInput
						maxLength={RECOVERY_CODE_LENGTH}
						onChange={onCodeFilled}
						inputMode='numeric'
						className='text-center'
					/>
				</View>

				<View className='mt-8'>
					<CustomButton
						disabled={recoveryCode.length !== RECOVERY_CODE_LENGTH}
						label={t('passwordResetCode.sendButton')}
						onPress={goToPasswordNewPass}
					/>
				</View>
			</View>
		</Page>
	)
}
