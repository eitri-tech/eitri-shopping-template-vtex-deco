import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Page, View } from 'eitri-luminus'
import { useLocalShoppingCart } from '../providers/LocalCart'
import { getPaymentSystem } from '../utils/getPaymentSystem'
import type { PaymentSystemGroup, ResolvedPaymentSystem } from '../utils/getPaymentSystem'
import { navigate } from '../services/navigationService'
import {
	BottomInset,
	HeaderReturn,
	HeaderText,
	HeaderContentWrapper,
	CustomInput,
	CustomButton,
	TrackingService,
	Loading
} from 'eitri-shopping-template-vtex-deco-shared'
import FixedBottom from '../components/FixedBottom/FixedBottom'
import { verifySocialNumber } from '../utils/verifySocialNumber'
import type { RouteProps } from '../types/route'

interface StoreCardFormState {
	systemGroup?: PaymentSystemGroup
	cardNumber?: string
}

interface StoreCardData {
	cardNumber: string
	holderName: string
	dueDate: string
	document: string
	validationCode: string
}

export default function StoreCardForm(props: RouteProps<StoreCardFormState>) {
	const { cart, setCardInfo, selectPaymentOption } = useLocalShoppingCart()

	const PAGE = 'Cadastro de cartão da loja'

	const systemGroup = props.location?.state?.systemGroup
	const propCardNumber = props.location?.state?.cardNumber

	const [selectedPaymentSystem, setSelectedPaymentSystem] = useState<ResolvedPaymentSystem | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	const [cardData, setCardData] = useState<StoreCardData>({
		cardNumber: propCardNumber || '',
		holderName: '',
		dueDate: '',
		document: '',
		validationCode: ''
	})

	const [validDueDate, setValidDueDate] = useState(false)
	const [validCard, setValidCard] = useState(false)
	const [validDocument, setValidDocument] = useState(false)

	useEffect(() => {
		TrackingService.sendScreenView('Cadastro de cartão da loja', 'StoreCardForm')
	}, [])

	useEffect(() => {
		if (cardData?.cardNumber && cardData?.cardNumber.length > 18) {
			const paymentSystem = findPaymentSystem(cardData?.cardNumber)

			if (paymentSystem) {
				setValidCard(true)
				setSelectedPaymentSystem(paymentSystem)
			} else {
				const paymentSystemGroups = cart ? getPaymentSystem(cart) : undefined
				const storeCardSystemGroup = paymentSystemGroups?.find(ps => ps.groupName === 'creditCardPaymentGroup')
				if (storeCardSystemGroup) {
					const isStoreCard = storeCardSystemGroup?.paymentSystems?.some(method => {
						const regex = RegExp(method?.validator?.regex ?? '')
						return regex.test(cardData?.cardNumber?.replace(/\D+/g, ''))
					})
					if (isStoreCard) {
						navigate(
							'AddCardForm',
							{
								cardNumber: cardData?.cardNumber
							},
							true
						)
						return
					}
				}

				setValidCard(false)
			}
		} else {
			setValidCard(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cardData.cardNumber])

	useEffect(() => {
		if (!cardData?.dueDate) {
			setValidDueDate(false)
			return
		}

		const value = cardData?.dueDate
		// Check format MM/YY
		const regex = /^(0[1-9]|1[0-2])\/\d{2}$/
		if (!regex.test(value)) {
			setValidDueDate(false)
			return
		}

		const [month, _year] = value.split('/').map(Number)

		const year = 2000 + _year

		const now = new Date()
		const currentYear = now.getFullYear()
		const currentMonth = now.getMonth() + 1 // 0-based

		// Validate if future or current month/year
		if (year === currentYear && month >= currentMonth) {
			setValidDueDate(true)
			return
		}
		if (year > currentYear) {
			setValidDueDate(true)
			return
		}

		setValidDueDate(false)
	}, [cardData?.dueDate])

	useEffect(() => {
		if (!cardData?.document) {
			setValidDocument(false)
			return
		}

		setValidDocument(verifySocialNumber(cardData?.document))
	}, [cardData?.document])

	const handleCardDataChange = (key: keyof StoreCardData, e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		const cardInfo = { ...cardData, [key]: value }
		setCardData(cardInfo)
	}

	const findPaymentSystem = (cardNumber: string): ResolvedPaymentSystem | undefined => {
		return systemGroup?.paymentSystems?.find(method => {
			const regex = RegExp(method.validator?.regex ?? '')
			return regex.test(cardNumber.replace(/\D+/g, ''))
		})
	}

	const setPaymentSystem = async () => {
		try {
			setIsLoading(true)
			if (selectedPaymentSystem && cart) {
				const payload = {
					payments: [
						{
							paymentSystem: selectedPaymentSystem.id,
							installmentsInterestRate: 0,
							installments: 1,
							referenceValue: cart.value,
							value: cart.value,
							hasDefaultBillingAddress: true
						}
					],
					giftCards: cart.paymentData?.giftCards
				}
				await selectPaymentOption?.(payload)
			}
			setCardInfo?.({ ...cardData })
			if (cart) {
				TrackingService.addPaymentInfoEvent(cart, selectedPaymentSystem?.name)
			}
			navigate('Installments', { paymentSystem: selectedPaymentSystem })
			setIsLoading(false)
		} catch (e) {
			setIsLoading(false)
		}
	}

	const validToProceed = () => {
		return validCard && !!cardData?.holderName && !!cardData?.validationCode && validDueDate && validDocument
	}

	return (
		<Page title={PAGE}>
			<HeaderContentWrapper>
				<HeaderReturn />
				<HeaderText text={'Cartão da loja'} />
			</HeaderContentWrapper>

			<Loading
				fullScreen
				isLoading={isLoading}
			/>

			<View className='p-4 flex flex-col gap-4'>
				<View className='bg-white rounded p-4 flex flex-col gap-2'>
					<View>
						<CustomInput
							placeholder={'Insira o número do seu cartão'}
							label={'Número do cartão'}
							value={cardData?.cardNumber}
							inputMode='numeric'
							mask='9999 9999 9999 9999'
							variant='mask'
							onChange={(e: ChangeEvent<HTMLInputElement>) => handleCardDataChange('cardNumber', e)}
							error={!validCard && cardData?.cardNumber && 'Verifique o número digitado'}
						/>
					</View>

					<CustomInput
						showClearInput={false}
						placeholder={'Nome impresso no cartão'}
						label={'Nome impresso no cartão'}
						value={cardData?.holderName}
						onChange={(e: ChangeEvent<HTMLInputElement>) => handleCardDataChange('holderName', e)}
					/>

					<View className='w-full flex flex-row gap-1'>
						<View className={'w-1/3'}>
							<CustomInput
								label='Validade'
								placeholder={'MM/AA'}
								value={cardData?.dueDate}
								onChange={(e: ChangeEvent<HTMLInputElement>) => handleCardDataChange('dueDate', e)}
								variant='mask'
								inputMode='numeric'
								mask='99/99'
								error={!validDueDate && cardData?.dueDate && 'Data inválida'}
							/>
						</View>
						<View className={'w-2/3'}>
							<CustomInput
								label='Código de segurança'
								placeholder={'Código de segurança'}
								value={cardData?.validationCode}
								onChange={(e: ChangeEvent<HTMLInputElement>) => handleCardDataChange('validationCode', e)}
								inputMode='numeric'
								variant='mask'
								mask='999'
							/>
						</View>
					</View>

					<View className='w-full flex flex-row gap-1'>
						<CustomInput
							label='CPF'
							placeholder={'CPF'}
							value={cardData?.document}
							onChange={(e: ChangeEvent<HTMLInputElement>) => handleCardDataChange('document', e)}
							inputMode='numeric'
							variant='mask'
							mask='999.999.999-99'
							error={!validDocument && cardData?.document && 'Verifique o CPF digitado'}
						/>
					</View>
				</View>

				<BottomInset />
			</View>

			<FixedBottom
				className='flex flex-col align-center gap-4'
				offSetHeight={77}>
				<CustomButton
					label='Continuar'
					disabled={!validToProceed()}
					onClick={setPaymentSystem}
				/>
			</FixedBottom>
		</Page>
	)
}
