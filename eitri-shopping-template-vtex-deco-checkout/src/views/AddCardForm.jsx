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
import { useLocalShoppingCart } from '../providers/LocalCart'
import { getPaymentSystem } from '../utils/getPaymentSystem'
import FixedBottom from '../components/FixedBottom/FixedBottom'
import CreditCardBillingAddress from '../components/PaymentsGroups/Groups/Components/CreditCardBillingAddress'
import { navigate } from '../services/navigationService'
import CreditCardDisplay from '../components/CreditCardDisplay/CreditCardDisplay'
import { useTranslation } from 'eitri-i18n'

export default function AddCardForm(props) {
	const { cart, cardInfo, setCardInfo, selectPaymentOption } = useLocalShoppingCart()
	const { t } = useTranslation()

	const [paymentSystemName, setPaymentSystemName] = useState('')
	const [systemGroup, setSystemGroups] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [formCardInfo, setFormCardInfo] = useState(null)

	const [validCard, setValidCard] = useState(false)
	const [validDueDate, setValidDueDate] = useState(false)

	useEffect(() => {
		TrackingService.sendScreenView('Adicionar cartão', 'AddCardForm')
	}, [])

	useEffect(() => {
		const paymentSystemGroups = getPaymentSystem(cart)
		const cardSystemGroup = paymentSystemGroups.find(ps => ps.groupName === 'creditCardPaymentGroup')
		setSystemGroups(cardSystemGroup)
	}, [cart])

	useEffect(() => {
		if (formCardInfo?.cardNumber && formCardInfo?.cardNumber.length > 15) {
			const paymentSystem = findPaymentSystem(formCardInfo?.cardNumber)

			if (paymentSystem) {
				setValidCard(true)
				setPaymentSystemName(paymentSystem.name)
			} else {
				setValidCard(false)
			}
		} else {
			setValidCard(false)
		}
	}, [formCardInfo?.cardNumber])

	useEffect(() => {
		if (!formCardInfo?.dueDate) {
			return setValidDueDate(false)
		}

		const value = formCardInfo?.dueDate
		// Check format MM/YY
		const regex = /^(0[1-9]|1[0-2])\/\d{2}$/
		if (!regex.test(value)) return setValidDueDate(false)

		const [month, year] = value.split('/').map(Number)

		// Adjust year to 2000+ (e.g., 25 -> 2025)
		const fullYear = 2000 + year

		const now = new Date()
		const currentYear = now.getFullYear()
		const currentMonth = now.getMonth() + 1 // 0-based

		// Validate if future or current month/year
		if (fullYear === currentYear && month >= currentMonth) return setValidDueDate(true)
		if (fullYear > currentYear) return setValidDueDate(true)

		return setValidDueDate(false)
	}, [formCardInfo?.dueDate])

	const findPaymentSystem = cardNumber => {
		return systemGroup?.paymentSystems?.find(method => {
			const regex = RegExp(method.validator.regex)
			return regex.test(cardNumber.replace(/\D+/g, ''))
		})
	}

	const setPaymentSystem = async () => {
		try {
			setIsLoading(true)
			const paymentSystem = findPaymentSystem(formCardInfo?.cardNumber)
			if (paymentSystem) {
				const payload = {
					payments: [
						{
							paymentSystem: paymentSystem.id,
							installmentsInterestRate: 0,
							installments: 1,
							referenceValue: cart.value,
							value: cart.value,
							hasDefaultBillingAddress: true
						}
					],
					giftCards: cart.paymentData.giftCards
				}
				await selectPaymentOption(payload)
			}
			setCardInfo({ ...cardInfo, ...formCardInfo })
			navigate('Installments', { paymentSystem })
			setIsLoading(false)
		} catch (e) {
			setIsLoading(false)
		}
	}

	const handleCardDataChange = (key, e) => {
		const value = e.target.value
		setFormCardInfo(prev => ({ ...prev, [key]: value }))
	}

	const validToProceed = () => {
		return validCard && !!formCardInfo?.holderName && validDueDate && !!formCardInfo?.validationCode
	}

	return (
		<Page title='Checkout - Dados de pagamento'>
			<HeaderContentWrapper>
				<HeaderReturn />
				<HeaderText text={t('addCardForm.txtHeader')} />
			</HeaderContentWrapper>

			<Loading
				fullScreen
				isLoading={isLoading}
			/>

			<View className='p-4 pb-0'>
				<CreditCardDisplay
					cardInfo={formCardInfo}
					cardName={paymentSystemName}
				/>
			</View>

			<View className='m-4 border bg-white p-4 rounded'>
				<View className='flex flex-col gap-2'>
					<View className='relative'>
						<CustomInput
							placeholder={t('creditCard.labelCardNumber')}
							label={'Número do cartão'}
							value={formCardInfo?.cardNumber || ''}
							inputMode='numeric'
							mask='9999 9999 9999 9999'
							variant='mask'
							onChange={e => handleCardDataChange('cardNumber', e)}
							error={!validCard && formCardInfo?.cardNumber && 'Verifique o número digitado'}
						/>
						{paymentSystemName && (
							<View className='absolute top-[38px] right-3'>
								<CardIcon
									height={25}
									width={39}
									iconKey={paymentSystemName}
								/>
							</View>
						)}
					</View>

					<CustomInput
						showClearInput={false}
						placeholder={'Nome impresso no cartão'}
						label={'Nome impresso no cartão'}
						value={formCardInfo?.holderName || ''}
						onChange={text => handleCardDataChange('holderName', text)}
					/>
					<View className='flex gap-2 w-full flex-row'>
						<CustomInput
							label='Validade'
							placeholder={'MM/AA'}
							value={formCardInfo?.dueDate || ''}
							onChange={text => handleCardDataChange('dueDate', text)}
							inputMode='numeric'
							variant='mask'
							mask='99/99'
							error={!validDueDate && formCardInfo?.dueDate && 'Data inválida'}
						/>
						<CustomInput
							color='accent-100'
							label='CVV'
							placeholder={'CVV'}
							value={formCardInfo?.validationCode || ''}
							onChange={text => handleCardDataChange('validationCode', text)}
							inputMode='numeric'
							variant='mask'
							mask='9999'
						/>
					</View>

					<CreditCardBillingAddress />
				</View>
			</View>

			<View className='px-4 pb-4'>
				<Text className='text-accent-100 font-bold font-sm'>{t('addCardForm.txtBrandsAccepted')}</Text>
				<View className='flex gap-1 justify-between mt-2'>
					{systemGroup?.paymentSystems?.map(system => {
						return (
							<View
								key={system.name}
								className='flex-1'>
								<View className='flex justify-center items-center w-full max-w-[40px]'>
									<CardIcon
										width={'100%'}
										iconKey={system.name}
									/>
								</View>
							</View>
						)
					})}
				</View>
			</View>

			<FixedBottom
				className='flex flex-col align-center gap-4'
				offSetHeight={77}>
				<CustomButton
					disabled={!validToProceed()}
					label={'Continuar'}
					onClick={setPaymentSystem}
				/>
			</FixedBottom>

			<BottomInset />
		</Page>
	)
}
