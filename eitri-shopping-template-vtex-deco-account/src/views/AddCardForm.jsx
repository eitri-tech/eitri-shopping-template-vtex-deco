import Eitri from 'eitri-bifrost'
import {
	HeaderContentWrapper,
	HeaderReturn,
	HeaderText,
	Loading,
	BottomInset,
	GenericBox,
	CustomButton,
	CustomInput,
	CheckIcon
} from 'eitri-shopping-template-vtex-deco-shared'
import Alert from '../components/Alert/Alert'
import Recaptcha from '../services/Recaptcha'
import { addNewCard } from '../services/CustomerService'
import { getAddresses, resolvePostalCode } from '../services/AddressService'
import { sendScreenView } from '../services/TrackingService'
import { useTranslation } from 'eitri-i18n'

const PAYMENT_SYSTEMS = ['Visa', 'Mastercard', 'American Express', 'Elo', 'Hipercard', 'Diners']
const DOCUMENT_TYPES = ['cpf', 'cnpj']

const EMPTY_ADDRESS = {
	addressType: 'residential',
	street: '',
	number: '',
	complement: '',
	neighborhood: '',
	city: '',
	state: '',
	country: 'BRA',
	postalCode: '',
	receiverName: '',
	reference: '',
	geoCoordinates: [],
	addressQuery: null
}

export default function AddCardForm(props) {
	const { t } = useTranslation()
	const recaptchaRef = useRef()

	const [recaptchaSiteKey, setRecaptchaSiteKey] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [isLoadingPostalCode, setIsLoadingPostalCode] = useState(false)
	const [isLoadingAddresses, setIsLoadingAddresses] = useState(true)
	const [showError, setShowError] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')

	const [savedAddresses, setSavedAddresses] = useState([])
	// null = pending, 'manual' = manual entry, or an addressId string
	const [selectedAddressId, setSelectedAddressId] = useState(null)

	const [card, setCard] = useState({
		cardNumber: '',
		cardHolder: '',
		expiryDate: '',
		csc: '',
		paymentSystem: 'Visa',
		document: '',
		documentType: 'cpf'
	})

	const [address, setAddress] = useState(EMPTY_ADDRESS)

	useEffect(() => {
		sendScreenView('Adicionar cartão', 'AddCardForm')

		Eitri.environment
			.getRemoteConfigs()
			.then(rc => {
				const key = rc?.appConfigs?.checkout?.recaptchaKey
				if (key) setRecaptchaSiteKey(key)
			})
			.catch(() => {})

		getAddresses()
			.then(data => {
				setSavedAddresses(data)
				if (!data || data.length === 0) setSelectedAddressId('manual')
			})
			.catch(() => setSelectedAddressId('manual'))
			.finally(() => setIsLoadingAddresses(false))
	}, [])

	useEffect(() => {
		if (selectedAddressId !== 'manual') return
		const digits = address.postalCode?.replace(/\D/g, '') || ''
		if (digits.length === 8) fillFromPostalCode(address.postalCode)
	}, [address.postalCode])

	const fillFromPostalCode = async postalCode => {
		setIsLoadingPostalCode(true)
		try {
			const { street, neighborhood, city, state, country, geoCoordinates } = await resolvePostalCode(postalCode)
			setAddress(prev => ({
				...prev,
				street,
				neighborhood,
				city,
				state,
				country: country || 'BRA',
				geoCoordinates: geoCoordinates || []
			}))
		} catch (e) {}
		setIsLoadingPostalCode(false)
	}

	const selectSavedAddress = addr => {
		setSelectedAddressId(addr.addressId)
		setAddress({
			addressType: addr.addressType || 'residential',
			street: addr.street || '',
			number: addr.number || '',
			complement: addr.complement || '',
			neighborhood: addr.neighborhood || '',
			city: addr.city || '',
			state: addr.state || '',
			country: addr.country || 'BRA',
			postalCode: addr.postalCode || '',
			receiverName: addr.receiverName || '',
			reference: addr.reference || '',
			geoCoordinates: addr.geoCoordinates || [],
			addressQuery: null
		})
	}

	const selectManual = () => {
		setSelectedAddressId('manual')
		setAddress(EMPTY_ADDRESS)
	}

	const setCardField = (field, value) => setCard(prev => ({ ...prev, [field]: value }))
	const setAddressField = (field, value) => setAddress(prev => ({ ...prev, [field]: value }))

	const canSubmit = () => {
		const cardDigits = card.cardNumber.replace(/\D/g, '')
		const docDigits = card.document.replace(/\D/g, '')
		const minDocLength = card.documentType === 'cpf' ? 11 : 14
		return (
			cardDigits.length === 16 &&
			!!card.cardHolder &&
			card.expiryDate.length >= 5 &&
			card.csc.length >= 3 &&
			!!card.paymentSystem &&
			docDigits.length >= minDocLength &&
			!!address.street &&
			!!address.number &&
			!!address.neighborhood &&
			!!address.city &&
			!!address.state &&
			address.postalCode.replace(/\D/g, '').length === 8 &&
			!!address.receiverName &&
			!isLoading
		)
	}

	const handleSubmit = async () => {
		setIsLoading(true)
		try {
			const captchaToken = recaptchaSiteKey ? await recaptchaRef?.current?.getRecaptchaToken() : null

			await addNewCard({ ...card, address }, captchaToken)
			Eitri.navigation.back()
		} catch (e) {
			console.error('AddCardForm error', e)
			setErrorMessage(t('savedCards.errorAddCard'))
			setShowError(true)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Page title='Adicionar cartão' topInset>
			<Loading
				isLoading={isLoading}
				fullScreen
			/>

			<HeaderContentWrapper>
				<HeaderReturn />
				<HeaderText text={t('savedCards.addCardTitle')} />
			</HeaderContentWrapper>

			<View className='p-4 flex flex-col gap-4 pb-8'>
				{/* Card data */}
				<GenericBox className='flex flex-col gap-3 p-4'>
					<Text className='font-bold text-base'>{t('savedCards.sectionCardData')}</Text>

					<CustomInput
						label={t('savedCards.labelCardNumber')}
						inputMode='numeric'
						variant='mask'
						mask='9999 9999 9999 9999'
						value={card.cardNumber}
						onChange={e => setCardField('cardNumber', e.target.value)}
					/>

					<CustomInput
						label={t('savedCards.labelCardHolder')}
						value={card.cardHolder}
						onChange={e => setCardField('cardHolder', e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
					/>

					<View className='flex gap-2'>
						<View className='w-1/2'>
							<CustomInput
								label={t('savedCards.labelExpiry')}
								inputMode='numeric'
								variant='mask'
								mask='99/99'
								placeholder='MM/AA'
								value={card.expiryDate}
								onChange={e => setCardField('expiryDate', e.target.value)}
							/>
						</View>
						<View className='w-1/2'>
							<CustomInput
								label={t('savedCards.labelCsc')}
								inputMode='numeric'
								type='password'
								maxLength={4}
								value={card.csc}
								onChange={e => setCardField('csc', e.target.value.replace(/\D/g, ''))}
							/>
						</View>
					</View>

					<View className='flex flex-col gap-1'>
						<Text className='text-sm text-gray-600'>{t('savedCards.labelPaymentSystem')}</Text>
						<View className='flex flex-wrap gap-2'>
							{PAYMENT_SYSTEMS.map(brand => (
								<View
									key={brand}
									onClick={() => setCardField('paymentSystem', brand)}
									className={`px-3 py-1 rounded-full border text-sm ${
										card.paymentSystem === brand
											? 'bg-primary text-primary-content border-primary'
											: 'border-gray-300 text-gray-600'
									}`}>
									<Text className='text-sm'>{brand}</Text>
								</View>
							))}
						</View>
					</View>
				</GenericBox>

				{/* Document */}
				<GenericBox className='flex flex-col gap-3 p-4'>
					<Text className='font-bold text-base'>{t('savedCards.sectionDocument')}</Text>

					<View className='flex gap-2'>
						<View className='w-1/3 flex flex-col gap-1'>
							<Text className='text-sm text-gray-600'>{t('savedCards.labelDocType')}</Text>
							<View className='flex gap-1'>
								{DOCUMENT_TYPES.map(type => (
									<View
										key={type}
										onClick={() => setCardField('documentType', type)}
										className={`px-2 py-1 rounded-full border ${
											card.documentType === type
												? 'bg-primary text-primary-content border-primary'
												: 'border-gray-300 text-gray-600'
										}`}>
										<Text className='text-xs uppercase'>{type}</Text>
									</View>
								))}
							</View>
						</View>
						<View className='flex-1'>
							<CustomInput
								label={t('savedCards.labelDocument')}
								inputMode='numeric'
								variant='mask'
								mask={card.documentType === 'cpf' ? '999.999.999-99' : '99.999.999/9999-99'}
								value={card.document}
								onChange={e => setCardField('document', e.target.value)}
							/>
						</View>
					</View>
				</GenericBox>

				{/* Billing address */}
				<GenericBox className='flex flex-col gap-3 p-4'>
					<Text className='font-bold text-base'>{t('savedCards.sectionAddress')}</Text>

					{isLoadingAddresses ? (
						<View className='flex justify-center py-4'>
							<Loading isLoading={true} />
						</View>
					) : (
						<>
							{savedAddresses.length > 0 && (
								<View className='flex flex-col gap-2'>
									<Text className='text-sm text-gray-500'>{t('savedCards.selectAddress')}</Text>

									{savedAddresses.map(addr => (
										<View
											key={addr.addressId}
											onClick={() => selectSavedAddress(addr)}
											className={`p-3 rounded-xl border flex items-start gap-3 ${
												selectedAddressId === addr.addressId
													? 'border-primary bg-primary/5'
													: 'border-gray-200'
											}`}>
											<View
												className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
													selectedAddressId === addr.addressId
														? 'border-primary bg-primary'
														: 'border-gray-300'
												}`}>
												{selectedAddressId === addr.addressId && (
													<CheckIcon
														size={12}
														className='text-primary-content'
													/>
												)}
											</View>
											<View className='flex flex-col gap-0.5'>
												<Text className='text-sm font-medium'>
													{addr.street}, {addr.number}
													{addr.complement ? ` - ${addr.complement}` : ''}
												</Text>
												<Text className='text-xs text-gray-500'>
													{addr.neighborhood} · {addr.city}/{addr.state}
												</Text>
												<Text className='text-xs text-gray-400'>{addr.postalCode}</Text>
											</View>
										</View>
									))}

									<View
										onClick={selectManual}
										className={`p-3 rounded-xl border flex items-center gap-3 ${
											selectedAddressId === 'manual'
												? 'border-primary bg-primary/5'
												: 'border-gray-200'
										}`}>
										<View
											className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
												selectedAddressId === 'manual'
													? 'border-primary bg-primary'
													: 'border-gray-300'
											}`}>
											{selectedAddressId === 'manual' && (
												<CheckIcon
													size={12}
													className='text-primary-content'
												/>
											)}
										</View>
										<Text className='text-sm font-medium'>{t('savedCards.enterManually')}</Text>
									</View>
								</View>
							)}

							{selectedAddressId === 'manual' && (
								<View className='flex flex-col gap-3'>
									<CustomInput
										label={t('addressForm.postalCode')}
										inputMode='numeric'
										variant='mask'
										mask='99999-999'
										value={address.postalCode}
										onChange={e => setAddressField('postalCode', e.target.value)}
										disabled={isLoadingPostalCode}
									/>

									<CustomInput
										label={t('addressForm.street')}
										value={address.street}
										onChange={e => setAddressField('street', e.target.value)}
										disabled={isLoadingPostalCode}
									/>

									<View className='flex gap-2'>
										<View className='w-1/2'>
											<CustomInput
												label={t('addressForm.number')}
												inputMode='numeric'
												value={address.number}
												onChange={e => setAddressField('number', e.target.value)}
											/>
										</View>
										<View className='w-1/2'>
											<CustomInput
												label={t('addressForm.complement')}
												value={address.complement}
												onChange={e => setAddressField('complement', e.target.value)}
											/>
										</View>
									</View>

									<CustomInput
										label={t('addressForm.neighborhood')}
										value={address.neighborhood}
										onChange={e => setAddressField('neighborhood', e.target.value)}
										disabled={isLoadingPostalCode}
									/>

									<View className='flex gap-2'>
										<View className='w-1/2'>
											<CustomInput
												label={t('addressForm.city')}
												value={address.city}
												onChange={e => setAddressField('city', e.target.value)}
												disabled={isLoadingPostalCode}
											/>
										</View>
										<View className='w-1/2'>
											<CustomInput
												label={t('addressForm.state')}
												value={address.state}
												onChange={e => setAddressField('state', e.target.value)}
												disabled={isLoadingPostalCode}
											/>
										</View>
									</View>

									<CustomInput
										label={t('addressForm.recipient')}
										value={address.receiverName}
										onChange={e =>
											setAddressField('receiverName', e.target.value.replace(/[^a-zA-Z\s]/g, ''))
										}
									/>
								</View>
							)}
						</>
					)}
				</GenericBox>

				<CustomButton
					disabled={!canSubmit()}
					label={t('savedCards.submitCard')}
					onPress={handleSubmit}
				/>
			</View>

			{recaptchaSiteKey && (
				<Recaptcha
					ref={recaptchaRef}
					siteKey={recaptchaSiteKey}
				/>
			)}

			<BottomInset />

			<Alert
				type='negative'
				show={showError}
				onDismiss={() => setShowError(false)}
				duration={7}
				message={errorMessage}
			/>
		</Page>
	)
}
