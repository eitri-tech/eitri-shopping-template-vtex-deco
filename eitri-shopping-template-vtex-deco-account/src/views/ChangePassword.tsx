import { useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import { Page, View, Text } from 'eitri-luminus'
import {
	Loading,
	HeaderContentWrapper,
	HeaderReturn,
	HeaderText,
	CustomButton,
	CustomInput,
	GenericBox,
	BiometricService
} from 'eitri-shopping-template-vtex-deco-shared'
import Alert from '../components/Alert/Alert'
import { sendPasswordResetCode, setPassword, changePassword } from '../services/CustomerService'
import { navigate, PAGES } from '../services/NavigationService'
import { useTranslation } from 'eitri-i18n'
import { sendScreenView } from '../services/TrackingService'
import { addonUserTappedActiveTabListener } from '../utils/backToTopListener'
import type { RouteProps } from '../types/route'

const RECOVERY_CODE_LENGTH = 6

interface RequirementItemProps {
	valid: boolean
	text: string
}

const RequirementItem = (props: RequirementItemProps) => {
	const { valid, text } = props
	return (
		<View className={`flex items-center gap-2 ${valid ? 'text-green-600' : 'text-red-600'}`}>
			{valid ? (
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
			<Text className='text-sm'>{text}</Text>
		</View>
	)
}

interface ChangePasswordState {
	email?: string
	passwordLastUpdate?: string | null
}

export default function ChangePassword(props: RouteProps<ChangePasswordState>) {
	const email = props?.location?.state?.email
	const passwordLastUpdate = props?.location?.state?.passwordLastUpdate
	const isFirstPassword = passwordLastUpdate === null

	const { t } = useTranslation()

	const [code, setCode] = useState('')
	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [showErrorAlert, setShowErrorAlert] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')

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
		sendScreenView('Alterar senha', 'ChangePassword')

		if (isFirstPassword) {
			sendCode()
		}
	}, [])

	const sendCode = async () => {
		try {
			if (email) await sendPasswordResetCode(email)
		} catch (e) {
			setErrorMessage(t('changePassword.errorSendCode'))
			setShowErrorAlert(true)
		}
	}

	const syncBiometricCredentials = async updatedPassword => {
		try {
			if (await BiometricService.hasSavedCredentials()) {
				await BiometricService.updateSavedCredentials(email, updatedPassword)
			}
		} catch (e) {
			console.error('Erro ao atualizar a senha salva na biometria', e)
		}
	}

	const handleSubmit = async () => {
		if (!email) return
		setLoading(true)
		try {
			if (isFirstPassword) {
				await setPassword(email, code, newPassword)
			} else {
				await changePassword(email, currentPassword, newPassword)
			}
			await syncBiometricCredentials(newPassword)
			navigate(PAGES.HOME, {}, true)
		} catch (e) {
			console.error('ChangePassword error', e)
			setErrorMessage(t('changePassword.errorChange'))
			setShowErrorAlert(true)
		} finally {
			setLoading(false)
		}
	}

	const allRequirementsMet = requirements.every(req => req.valid)
	const passwordsMatch = newPassword === confirmPassword && !!newPassword
	const firstInputValid = isFirstPassword ? code.length === RECOVERY_CODE_LENGTH : !!currentPassword
	const canSubmit = firstInputValid && allRequirementsMet && passwordsMatch && !loading

	return (
		<Page
			title='Alterar senha'
			topInset>
			<Loading
				isLoading={loading}
				fullScreen={true}
			/>

			<HeaderContentWrapper>
				<HeaderReturn />
				<HeaderText text={t('changePassword.headerText')} />
			</HeaderContentWrapper>

			<View className='p-4 flex flex-col gap-4'>
				<GenericBox className='flex flex-col gap-4'>
					<View className='flex flex-col gap-1'>
						<Text className='font-bold text-xl'>{t('changePassword.title')}</Text>
						<Text className='text-sm text-gray-600'>
							{isFirstPassword
								? t('changePassword.subtitleFirstTime', { email })
								: t('changePassword.subtitleChange')}
						</Text>
					</View>

					{isFirstPassword ? (
						<View className='flex flex-col gap-1'>
							<CustomInput
								autoFocus={true}
								label={t('changePassword.labelCode')}
								maxLength={RECOVERY_CODE_LENGTH}
								inputMode='numeric'
								className='text-center tracking-widest'
								value={code}
								onChange={(e: ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
							/>
							<View
								className='flex justify-end'
								onClick={sendCode}>
								<Text className='text-xs text-primary'>{t('changePassword.resendCode')}</Text>
							</View>
						</View>
					) : (
						<CustomInput
							autoFocus={true}
							type='password'
							label={t('changePassword.labelCurrentPassword')}
							value={currentPassword}
							onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
						/>
					)}

					<CustomInput
						type='password'
						label={t('changePassword.labelNewPassword')}
						value={newPassword}
						onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
					/>

					<CustomInput
						type='password'
						label={t('changePassword.labelConfirmPassword')}
						value={confirmPassword}
						onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
					/>

					<View className='flex flex-col gap-1'>
						{requirements.map(req => (
							<RequirementItem
								key={req.text}
								valid={req.valid}
								text={req.text}
							/>
						))}
					</View>

					<CustomButton
						disabled={!canSubmit}
						label={t('changePassword.submitButton')}
						onPress={handleSubmit}
					/>
				</GenericBox>
			</View>

			<Alert
				type='negative'
				show={showErrorAlert}
				onDismiss={() => setShowErrorAlert(false)}
				duration={7}
				message={errorMessage}
			/>
		</Page>
	)
}
