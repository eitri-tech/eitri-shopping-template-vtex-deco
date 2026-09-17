import Eitri from 'eitri-bifrost'
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
import { useEffect, useState } from 'react'
import FixedBottom from '../components/FixedBottom/FixedBottom'
import { navigate } from '../services/navigationService'
import OtpLogin from '../components/OtpLogin/OtpLogin'
import { useCustomer } from '@/providers/Customer'

export default function PersonalData() {
	const { cart, addCustomerData } = useLocalShoppingCart()
	const { getUserByEmail } = useCustomer()

	const { t } = useTranslation()

	const [isLoading, setIsLoading] = useState(false)
	const [isLegalPerson, setIsLegalPerson] = useState(false)
	const [personalData, setPersonalData] = useState({
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
	const [inputOptions, setInputOptions] = useState([
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
			setPersonalData({
				...personalData,
				...cart.clientProfileData
			})
			if (cart?.clientProfileData?.email) {
				setUserDataVerified(true)
			}
		}
	}, [cart])

	const handleFormDataChange = (key, value) => {
		setPersonalData({ ...personalData, [key]: value })
	}

	const handleFormBlur = inputOption => {
		const updateOption = changes => {
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
			const validSocialNumber = verifySocialNumber(inputValue.replace(/\D/g, ''))
			if (!validSocialNumber) {
				return updateOption({ error: 'Documento inválido' })
			}
		}

		updateOption({})
	}

	const setUserData = async () => {
		const localPersonalData = {
			...personalData,
			documentType: 'cpf',
			isCorporate: isLegalPerson
		}
		setPersonalData(localPersonalData)
		addUserData(localPersonalData)
	}

	const addUserData = async userData => {
		try {
			setIsLoading(true)

			await addCustomerData(userData)

			setIsLoading(false)
			Eitri.navigation.navigate({ path: 'FreightResolver', replace: true })
		} catch (error) {
			console.log('error', error)
			if (error?.response?.data?.error?.code === 'CHK003') {
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
		const client = await getUserByEmail(personalData.email)

		registerToNotify({
			customerId: client?.userProfileId || '',
			email: personalData.email || ''
		})

		if (client.userProfileId) {
			const updatedCart = await addCustomerData({ email: personalData.email }, cart.orderFormId)
			if (cartHasCustomerData(updatedCart)) {
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
			verifySocialNumber(personalData?.document?.replace(/\D/g, '')) &&
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
								onChange={e => {
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
										value={personalData[inputOption.label] || ''}
										placeholder={inputOption.placeholder}
										inputMode={inputOption.inputMode}
										mask={inputOption.mask}
										variant={inputOption.mask ? 'mask' : ''}
										error={inputOption.error}
										onChange={e => {
											handleFormDataChange(inputOption.label, e.target.value)
										}}
										onBlur={e => {
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
