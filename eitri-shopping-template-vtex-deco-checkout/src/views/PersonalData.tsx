import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import Eitri from 'eitri-bifrost'
import { Page, View, Text } from 'eitri-luminus'
import { useLocalShoppingCart } from '../providers/LocalCart'
import { cartHasCustomerData, registerToNotify } from '../services/cartService'
import { useTranslation } from 'eitri-i18n'
import {
	HeaderContentWrapper,
	HeaderReturn,
	HeaderText,
	CustomButton,
	BottomInset,
	CustomInput,
	TrackingService,
	Loading
} from 'eitri-shopping-template-vtex-deco-shared'
import { verifySocialNumber } from '../utils/verifySocialNumber'
import FixedBottom from '../components/FixedBottom/FixedBottom'
import { navigate } from '../services/navigationService'
import OtpLogin from '../components/OtpLogin/OtpLogin'
import { useCustomer } from '../providers/Customer'

interface PersonalDataState {
	email: string
	firstName: string
	lastName: string
	documentType: string
	document: string
	phone: string
	dob: string
	corporateName: string
	tradeName: string
	corporateDocument: string
	corporatePhone: string
	isCorporate: boolean
	stateInscription: string
	[key: string]: unknown
}

interface InputOption {
	id?: string
	label: keyof PersonalDataState
	type: string
	title: string
	placeholder: string
	inputMode: string
	mask?: string
	corporateField?: boolean
	requeriedForPersonal: boolean
	requeriedForCorporate: boolean
	pristine: boolean
	error: string
}

// getUserByEmail is typed Promise<unknown> in CustomerContextValue — narrow here before reading userProfileId.
interface FoundCustomer {
	userProfileId?: string
	[key: string]: unknown
}

export default function PersonalData() {
	const { cart, addCustomerData } = useLocalShoppingCart()
	const { getUserByEmail } = useCustomer()

	const { t } = useTranslation()

	const [isLoading, setIsLoading] = useState(false)
	const [isLegalPerson, setIsLegalPerson] = useState(false)
	const [personalData, setPersonalData] = useState<PersonalDataState>({
		email: '',
		firstName: '',
		lastName: '',
		documentType: '',
		document: '',
		phone: '',
		dob: '',
		corporateName: '',
		tradeName: '',
		corporateDocument: '',
		corporatePhone: '',
		isCorporate: false,
		stateInscription: ''
	})
	const [userDataVerified, setUserDataVerified] = useState(false)
	const [showOtpLogin, setShowOtpLogin] = useState(false)
	const [inputOptions, setInputOptions] = useState<InputOption[]>([
		{
			id: 'firstName',
			label: 'firstName',
			type: 'string',
			title: t('personalData.frmName'),
			placeholder: t('personalData.placeholderName'),
			inputMode: 'string',
			requeriedForPersonal: true,
			requeriedForCorporate: true,
			pristine: true,
			error: ''
		},
		{
			label: 'lastName',
			type: 'string',
			title: t('personalData.frmLastName'),
			placeholder: t('personalData.placeholderLastName'),
			inputMode: 'string',
			requeriedForPersonal: true,
			requeriedForCorporate: true,
			pristine: true,
			error: ''
		},
		{
			label: 'document',
			type: 'string',
			title: t('personalData.frmTaxpayerId'),
			placeholder: t('personalData.placeholderTaxpayerId'),
			inputMode: 'numeric',
			mask: '999.999.999-99',
			requeriedForPersonal: true,
			requeriedForCorporate: false,
			pristine: true,
			error: ''
		},
		{
			label: 'phone',
			type: 'string',
			title: t('personalData.frmPhone'),
			placeholder: t('personalData.placeholderPhone'),
			inputMode: 'tel',
			mask: '(99) 99999-9999',
			requeriedForPersonal: true,
			requeriedForCorporate: true,
			pristine: true,
			error: ''
		},
		{
			label: 'corporateName',
			type: 'string',
			title: t('personalData.frmCorporateName'),
			placeholder: t('personalData.placeholderCorporateName'),
			inputMode: 'string',
			corporateField: true,
			requeriedForPersonal: true,
			requeriedForCorporate: true,
			pristine: true,
			error: ''
		},
		{
			label: 'tradeName',
			type: 'string',
			title: t('personalData.frmFantasyName'),
			placeholder: t('personalData.placeholderFantasyName'),
			inputMode: 'string',
			corporateField: true,
			requeriedForPersonal: true,
			requeriedForCorporate: true,
			pristine: true,
			error: ''
		},
		{
			label: 'corporateDocument',
			type: 'string',
			title: t('personalData.frmCorporateDocument'),
			placeholder: t('personalData.placeholderCorporateDocument'),
			inputMode: 'numeric',
			corporateField: true,
			mask: '99.999.999/9999-99',
			requeriedForPersonal: true,
			requeriedForCorporate: true,
			pristine: true,
			error: ''
		},
		{
			label: 'corporatePhone',
			type: 'string',
			title: t('personalData.frmCorporatePhone'),
			placeholder: t('personalData.placeholderCorporatePhone'),
			inputMode: 'tel',
			mask: '(99) 99999-9999',
			corporateField: true,
			requeriedForPersonal: true,
			requeriedForCorporate: true,
			pristine: true,
			error: ''
		},
		{
			label: 'stateInscription',
			type: 'string',
			title: t('personalData.frmStateInscription'),
			placeholder: t('personalData.placeholderStateInscription'),
			inputMode: 'string',
			corporateField: true,
			requeriedForPersonal: true,
			requeriedForCorporate: true,
			pristine: true,
			error: ''
		}
	])

	useEffect(() => {
		TrackingService.sendScreenView('Dados do cliente', 'PersonalData')
	}, [])

	useEffect(() => {
		if (cart) {
			setPersonalData(prev => ({
				...prev,
				...cart.clientProfileData
			}))
			if (cart?.clientProfileData?.email) {
				setUserDataVerified(true)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cart])

	const handleFormDataChange = (key: keyof PersonalDataState, value: unknown) => {
		setPersonalData({ ...personalData, [key]: value })
	}

	const handleFormBlur = (inputOption: InputOption) => {
		const updateOption = (changes: Partial<InputOption>) => {
			setInputOptions(prev => {
				const updated = [...prev]
				const index = updated.findIndex(opt => opt.label === inputOption.label)
				if (index !== -1) {
					updated[index] = { ...inputOption, error: '', pristine: false, ...changes }
				}
				return updated
			})
		}

		const inputValue = personalData[inputOption.label]

		const isRequiredError =
			(isLegalPerson && inputOption.requeriedForCorporate && !inputValue) ||
			(!isLegalPerson && inputOption.requeriedForPersonal && !inputValue)

		if (isRequiredError) {
			return updateOption({ error: 'Este campo é obrigatório' })
		}

		if (inputOption.label === 'document') {
			const validSocialNumber = verifySocialNumber(String(inputValue ?? '').replace(/\D/g, ''))
			if (!validSocialNumber) {
				return updateOption({ error: 'Documento inválido' })
			}
		}

		updateOption({})
	}

	const setUserData = async () => {
		const localPersonalData: PersonalDataState = {
			...personalData,
			documentType: 'cpf',
			isCorporate: isLegalPerson
		}
		setPersonalData(localPersonalData)
		addUserData(localPersonalData)
	}

	const addUserData = async (userData: PersonalDataState) => {
		try {
			setIsLoading(true)

			await addCustomerData?.(userData)

			setIsLoading(false)
			Eitri.navigation.navigate({ path: 'FreightResolver', replace: true })
		} catch (error) {
			console.log('error', error)
			const err = error as { response?: { data?: { error?: { code?: string } } } }
			if (err?.response?.data?.error?.code === 'CHK003') {
				setShowOtpLogin(true)
			}
		} finally {
			setIsLoading(false)
		}
	}

	const handleLegalPerson = () => {
		setIsLegalPerson(!isLegalPerson)
	}

	const findUserByEmail = async () => {
		setIsLoading(true)
		const client = (await getUserByEmail?.(personalData.email)) as FoundCustomer | undefined

		registerToNotify({
			customerId: client?.userProfileId || '',
			email: personalData.email || ''
		})

		if (client?.userProfileId) {
			const updatedCart = await addCustomerData?.({ email: personalData.email }, cart?.orderFormId)
			if (updatedCart && cartHasCustomerData(updatedCart)) {
				navigate('FreightResolver', {}, true)
			}
			setUserDataVerified(true)
		} else {
			setUserDataVerified(true)
		}

		setIsLoading(false)
	}

	const handleDataFilled = () => {
		return (
			personalData?.email !== '' &&
			personalData?.firstName !== '' &&
			personalData?.lastName !== '' &&
			verifySocialNumber(String(personalData?.document ?? '').replace(/\D/g, '')) &&
			personalData?.phone !== ''
		)
	}

	const isValidEmail = (() => {
		const regex = /^[\w.-]+@[\w.-]+\.\w{2,}$/
		return regex.test(personalData?.email)
	})()

	return (
		<Page title='Dados do cliente'>
			<HeaderContentWrapper>
				<HeaderReturn />
				<HeaderText text={t('personalData.title', 'Seus dados pessoais')} />
			</HeaderContentWrapper>

			{isLoading && <Loading fullScreen />}

			<View className='m-4 p-4 flex flex-col justify-between flex-grow bg-white shadow-sm border border-gray-300'>
				<View className='mb-2'>
					<Text className='block text-lg font-bold text-center'>Informe seu e-mail para continuar</Text>
					<Text className='block text-center'>Vamos verificar se você já fez alguma compra com a gente</Text>
				</View>

				<View className='flex flex-col gap-2'>
					<View className='flex justify-between gap-2 items-end w-full'>
						<View className='w-3/4'>
							<CustomInput
								autoFocus={true}
								label={t('personalData.frmEmail')}
								value={personalData['email'] || ''}
								onChange={(e: ChangeEvent<HTMLInputElement>) => {
									handleFormDataChange('email', e.target?.value?.toLowerCase())
								}}
								placeholder={t('personalData.placeholderEmail')}
								inputMode={'email'}
							/>
						</View>
						<View className='w-1/4'>
							<CustomButton
								disabled={!isValidEmail}
								label='OK'
								onPress={findUserByEmail}
							/>
						</View>
					</View>

					{userDataVerified && (
						<>
							{inputOptions
								.filter(input => (isLegalPerson ? true : !input.corporateField))
								.map(inputOption => (
									<CustomInput
										key={inputOption.label}
										label={inputOption.title}
										value={String(personalData[inputOption.label] ?? '')}
										placeholder={inputOption.placeholder}
										inputMode={inputOption.inputMode}
										mask={inputOption.mask}
										variant={inputOption.mask ? 'mask' : ''}
										error={inputOption.error}
										onChange={(e: ChangeEvent<HTMLInputElement>) => {
											handleFormDataChange(inputOption.label, e.target.value)
										}}
										onBlur={() => {
											handleFormBlur(inputOption)
										}}
									/>
								))}

							<View
								className='mt-3'
								onClick={handleLegalPerson}>
								<Text className='text-primary font-bold'>
									{isLegalPerson ? t('personalData.labelPerson') : t('personalData.labelCorporate')}
								</Text>
							</View>
						</>
					)}
				</View>
			</View>

			{userDataVerified && (
				<FixedBottom
					className='flex flex-col align-center gap-4'
					offSetHeight={77}>
					<CustomButton
						disabled={!handleDataFilled()}
						label={t('personalData.labelButton')}
						onPress={setUserData}
					/>
				</FixedBottom>
			)}

			<OtpLogin
				open={showOtpLogin}
				onClose={() => setShowOtpLogin(false)}
				onLogged={() => addUserData(personalData)}
			/>

			<BottomInset />
		</Page>
	)
}
