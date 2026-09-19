import { useState, useEffect, useRef } from 'react'
import type { ChangeEvent } from 'react'
import { Page, View, Text, Radio } from 'eitri-luminus'
import { getCustomerData, setCustomerData } from '../services/CustomerService'
import { sendScreenView } from '../services/TrackingService'
import { CustomButton, CustomInput, HeaderText, HeaderContentWrapper, Loading, HeaderReturn, BottomInset } from 'eitri-shopping-template-vtex-deco-shared'
import { useTranslation } from 'eitri-i18n'
import formatDateMMDDYYYY, { formatDate } from '../utils/utils'
import { addonUserTappedActiveTabListener } from '../utils/backToTopListener'
import { verifySocialNumber } from '../utils/verifySocialNumber'
import { RemoteConfig } from 'eitri-shopping-vtex-shared'
import Eitri from 'eitri-bifrost'
import type { RouteProps } from '../types/route'
import type { VtexCustomerProfile } from '../types/vtex'

interface EditProfileState {
	customerData?: VtexCustomerProfile
}

type ProfileErrors = Partial<Record<keyof VtexCustomerProfile, string>>

export default function EditProfile(props: RouteProps<EditProfileState>) {
	const [user, setUser] = useState<VtexCustomerProfile>({})
	const [isLoading, setIsLoading] = useState(false)
	const [errors, setErrors] = useState<ProfileErrors>({})
	const [showNotification, setShowNotification] = useState(false)
	const [saveError, setSaveError] = useState<string | null>(null)

	const notificationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const { t } = useTranslation()

	useEffect(() => {
		const customerData = props?.location?.state?.customerData

		if (!customerData) {
			loadMe()
		} else {
			setUser(prev => ({
				...prev,
				...customerData,
				birthDate: formatDateMMDDYYYY(customerData?.birthDate)
			}))
		}

		sendScreenView('Editar Perfil', 'EditProfile')
		addonUserTappedActiveTabListener()

		return () => {
			if (notificationTimerRef.current) {
				clearTimeout(notificationTimerRef.current)
			}
		}
	}, [])

	const handleInputChange = (target: keyof VtexCustomerProfile, e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setUser(prev => ({
			...prev,
			[target]: value
		}))

		if (errors[target]) {
			setErrors(prev => ({
				...prev,
				[target]: undefined
			}))
		}
	}

	const validateFields = () => {
		const newErrors: ProfileErrors = {}

		if (!user.firstName || user.firstName.trim() === '') {
			newErrors.firstName = t('editProfile.validationFirstName')
		}

		if (!user.lastName || user.lastName.trim() === '') {
			newErrors.lastName = t('editProfile.validationLastName')
		}

		if (!user.birthDate || user.birthDate.trim() === '') {
			newErrors.birthDate = t('editProfile.validationBirthdate')
		} else {
			const { isValid } = convertToISO(user.birthDate)
			if (!isValid) {
				newErrors.birthDate = t('editProfile.validationBirthdateInvalid')
			}
		}

		if (!user.homePhone || user.homePhone.trim() === '') {
			newErrors.homePhone = t('editProfile.validationPhone')
		}

		if (!user.gender) {
			newErrors.gender = t('editProfile.validationGender')
		}

		if (!user.document || user.document.trim() === '') {
			newErrors.document = t('editProfile.validationCPF')
		} else {
			const cpfNumbers = user.document.replace(/\D/g, '')
			if (cpfNumbers.length !== 11) {
				newErrors.document = t('editProfile.validationCPFDigits')
			} else if (!verifySocialNumber(cpfNumbers)) {
				newErrors.document = t('editProfile.validationCPFInvalid')
			}
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSave = async () => {
		if (!validateFields()) {
			return
		}

		setSaveError(null)

		try {
			setIsLoading(true)
			const { isValid, isoDate } = convertToISO(user.birthDate ?? '')

			if (!isValid) {
				setIsLoading(false)
				return
			}

			const normalizedPhone = user.homePhone
				? '+55' + user.homePhone.replace(/\D/g, '').replace(/^55/, '')
				: user.homePhone

			const updatedUser = await setCustomerData({
				...user,
				birthDate: isoDate,
				homePhone: normalizedPhone
			})

			setUser({
				...updatedUser,
				birthDate: formatDate(updatedUser?.birthDate ?? ''),
				homePhone: updatedUser?.homePhone?.replace('+55', '') || ''
			})

			setIsLoading(false)

			setShowNotification(true)
			notificationTimerRef.current = setTimeout(() => {
				setShowNotification(false)
			}, 3000)
		} catch (e) {
			setIsLoading(false)
			setSaveError(t('editProfile.errorSave'))
			console.error('EditProfile - handleSave error:', e)
		}
	}

	const loadMe = async () => {
		setIsLoading(true)
		try {
			const customerData = await getCustomerData()
			setUser({
				...customerData,
				birthDate: customerData?.birthDate ? formatDate(customerData?.birthDate) : '',
				homePhone: customerData?.homePhone?.replace('+55', '') || ''
			})
		} catch (e) {
			setSaveError(t('editProfile.errorLoad'))
			console.error('EditProfile - loadMe error:', e)
		} finally {
			setIsLoading(false)
		}
	}

	function convertToISO(dateStr: string): { isValid: boolean; isoDate?: string } {
		const dt = dateStr?.replaceAll('/', '')
		const day = parseInt(dt.substring(0, 2), 10)
		const month = parseInt(dt.substring(2, 4), 10)
		const year = parseInt(dt.substring(4, 8), 10)

		const date = new Date(year, month - 1, day)

		let isValid = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day

		if (!isValid) {
			return { isValid }
		}

		const today = new Date()
		const todayYear = today.getFullYear()
		const todayMonth = today.getMonth() + 1
		const todayDay = today.getDate()
		const ageDiff = todayYear - year

		isValid =
			ageDiff > 18 ||
			(ageDiff === 18 && todayMonth > month) ||
			(ageDiff === 18 && todayMonth === month && todayDay >= day)

		if (!isValid) {
			return { isValid }
		}

		return { isValid, isoDate: date.toISOString() }
	}

	const isFormValid = () => {
		const cpfNumbers = user.document ? user.document.replace(/\D/g, '') : ''
		return (
			user.firstName?.trim() !== '' &&
			user.lastName?.trim() !== '' &&
			user.birthDate?.trim() !== '' &&
			user.homePhone?.trim() !== '' &&
			user.gender &&
			user.document?.trim() !== '' &&
			cpfNumbers.length === 11
		)
	}

	const deleteAccountUrl = RemoteConfig.getContent('appConfigs.deleteAccountUrl')

	return (
		<Page
			title='Editar Perfil'
			statusBarTextColor='white'>
			<HeaderContentWrapper>
				<HeaderReturn />
				<HeaderText text={t('editProfile.title')} />
			</HeaderContentWrapper>

			<Loading
				fullScreen
				isLoading={isLoading}
			/>

			<View className='p-4 flex flex-col gap-4'>
				<View>
					<Text className='w-full font-bold text-xs'>{t('editProfile.lbName')} *</Text>
					<View className='mt-1 flex gap-1.5'>
						<CustomInput
							backgroundColor='background-color'
							placeholder={t('editProfile.lbName')}
							value={user?.firstName || ''}
							onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('firstName', e)}
							error={errors.firstName}
						/>
						{errors.firstName && <Text className='text-red-500 text-xs mt-1'>{errors.firstName}</Text>}
						<CustomInput
							backgroundColor='background-color'
							placeholder={t('editProfile.lbLastName')}
							value={user?.lastName || ''}
							onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('lastName', e)}
							error={errors.lastName}
						/>
						{errors.lastName && <Text className='text-red-500 text-xs mt-1'>{errors.lastName}</Text>}
					</View>
				</View>

				<View>
					<Text className='w-full mb-1 font-bold text-xs'>{t('editProfile.lbBirthdate')} *</Text>
					<CustomInput
						backgroundColor='background-color'
						placeholder='DD/MM/AAAA'
						variant='mask'
						mask='99/99/9999'
						inputMode='numeric'
						value={user?.birthDate || ''}
						onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('birthDate', e)}
						error={errors.birthDate}
					/>
					{errors.birthDate && <Text className='text-red-500 text-xs mt-1'>{errors.birthDate}</Text>}
				</View>

				<View>
					<Text className='w-full mb-1 font-bold text-xs'>{t('editProfile.lbPhone')} *</Text>
					<CustomInput
						backgroundColor='background-color'
						placeholder='(99) 99999-9999'
						value={user?.homePhone || ''}
						inputMode='numeric'
						variant='mask'
						onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('homePhone', e)}
						mask='(99) 99999-9999'
						error={errors.homePhone}
					/>
					{errors.homePhone && <Text className='text-red-500 text-xs mt-1'>{errors.homePhone}</Text>}
				</View>

				<View>
					<Text className='w-full mb-1 font-bold text-xs'>{t('editProfile.lbGender')} *</Text>
					<View className='flex gap-4'>
						<View
							className='flex flex-row items-center gap-1'
							sendFocusToInput>
							<Radio
								value={'male'}
								checked={user?.gender === 'male'}
								onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('gender', e)}
							/>
							<Text className='w-full ml-1'>{t('editProfile.lbGenderMale')}</Text>
						</View>
						<View
							className='flex flex-row items-center gap-1'
							sendFocusToInput>
							<Radio
								value={'female'}
								checked={user?.gender === 'female'}
								onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('gender', e)}
							/>
							<Text className='w-full ml-1'>{t('editProfile.lbGenderFemale')}</Text>
						</View>
					</View>
					{errors.gender && <Text className='text-red-500 text-xs mt-1'>{errors.gender}</Text>}
				</View>

				<View>
					<Text className='w-full mb-1 font-bold text-xs'>{t('editProfile.lbCPF')} *</Text>
					<CustomInput
						backgroundColor='background-color'
						placeholder='000.000.000-00'
						value={user.document || ''}
						inputMode='numeric'
						variant='mask'
						onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('document', e)}
						mask='999.999.999-99'
						error={errors.document}
					/>
					{errors.document && <Text className='text-red-500 text-xs mt-1'>{errors.document}</Text>}
				</View>

				<CustomButton
					width='100%'
					label={t('editProfile.lbSave')}
					onClick={handleSave}
					disabled={!isFormValid() || isLoading}
				/>

				{!!deleteAccountUrl && (
					<View
						className='w-full flex justify-center items-center px-4 mt-4'
						onClick={() => Eitri.openBrowser({ url: deleteAccountUrl, inApp: true })}>
						<Text className='text-sm font-bold text-gray-800'>Solicitar exclusão de conta</Text>
					</View>
				)}

				{saveError && (
					<View className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex flex-row items-center gap-2'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='20'
							height='20'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'>
							<circle
								cx='12'
								cy='12'
								r='10'
							/>
							<line
								x1='12'
								y1='8'
								x2='12'
								y2='12'
							/>
							<line
								x1='12'
								y1='16'
								x2='12.01'
								y2='16'
							/>
						</svg>
						<Text className='text-red-700 font-medium'>{saveError}</Text>
					</View>
				)}

				{showNotification && (
					<View className='bg-green-500 text-white px-4 py-3 rounded shadow-lg flex flex-row items-center justify-between'>
						<View className='flex flex-row items-center gap-2'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								width='20'
								height='20'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
								className='text-white'>
								<path d='M20 6L9 17l-5-5'></path>
							</svg>
							<Text className='text-white font-medium'>{t('editProfile.successSave')}</Text>
						</View>
					</View>
				)}
			</View>

			<BottomInset />
		</Page>
	)
}
