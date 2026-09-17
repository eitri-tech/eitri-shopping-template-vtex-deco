import Gift from '../../Icons/MethodIcons/Gift'
import GroupsWrapper from './GroupsWrapper'
import { useLocalShoppingCart } from '../../../providers/LocalCart'
import { formatAmountInCents, formatGiftCardRedemptionCode } from '../../../utils/utils'
import { navigate } from '../../../services/navigationService'
import { CustomButton, CustomInput, TrackingService, Loading } from 'eitri-shopping-template-vtex-deco-shared'

export default function GiftCard(props) {
	const { cart, setPaymentOption, startCart } = useLocalShoppingCart()

	const [isLoading, setIsLoading] = useState(false)
	const [redemptionCode, setRedemptionCode] = useState('')
	const [selected, setSelected] = useState(false)
	const [error, setError] = useState(false)
	const [giftCardValue, setGiftCardValue] = useState(0)

	useEffect(() => {
		if (cart?.paymentData?.giftCards?.length > 0) {
			loadCardValue(cart)
			setSelected(true)
		} else {
			setSelected(false)
			setGiftCardValue(0)
		}
	}, [])

	const loadCardValue = cart => {
		const giftCardsValue = cart.paymentData?.giftCards?.reduce((acc, giftCard) => acc + giftCard.value, 0) ?? 0
		setGiftCardValue(giftCardsValue)
	}

	const normalizeCode = value => value?.replace(/-/g, '')?.toLowerCase()

	const addGiftCard = async () => {
		setIsLoading(true)
		setError('')

		try {
			const payload = {
				payments: cart.paymentData.payments,
				giftCards: [
					...cart.paymentData.giftCards,
					{
						redemptionCode,
						inUse: true,
						isSpecialCard: false
					}
				]
			}

			const newCart = await setPaymentOption(payload)
			const applied = newCart?.paymentData?.giftCards?.some(
				gift => normalizeCode(gift.redemptionCode) === normalizeCode(redemptionCode)
			)

			if (!applied) {
				await startCart()
				setError('Código inválido')
				setTimeout(() => setError(''), 8000)
				return
			}

			loadCardValue(newCart)
			setRedemptionCode('')
			TrackingService.addPaymentInfoEvent(newCart, 'Vale Presente')
		} catch (e) {
			console.error('Error adding gift card:', e)
		} finally {
			setIsLoading(false)
		}
	}

	const removeGiftCart = async giftId => {
		try {
			const newGiftCardList = cart?.giftCards?.filter(gift => gift.id !== giftId)
			setIsLoading(true)
			const payload = {
				payments: cart.paymentData.payments,
				giftCards: newGiftCardList
			}
			await setPaymentOption(payload)
			setRedemptionCode('')
			setGiftCardValue(0)
			setIsLoading(false)
		} catch (e) {
			console.error('Error removing gift card:', e)
			setIsLoading(false)
		}
	}

	return (
		<GroupsWrapper
			title='Vale presente'
			icon={<Gift />}
			onPress={() => {}}>
			<View>
				{!selected && (
					<View onClick={() => setSelected(!selected)}>
						<Text className='text-primary font-bold'>Adicionar vale presente</Text>
					</View>
				)}
				{selected && (
					<>
						<View className='flex justify-between mt-2 gap-2 items-end w-full'>
							<View className='w-2/3'>
								<CustomInput
									placeholder='Insira o código do vale presente'
									value={redemptionCode}
									onChange={e => setRedemptionCode(e.target.value)}
								/>
							</View>
							<View className='w-1/3'>
								<CustomButton
									label='Adicionar'
									className='grow'
									onPress={addGiftCard}
								/>
							</View>
						</View>

						{error && (
							<View className='mt-2'>
								<Text className='text-red-500 text-xs font-bold'>{error}</Text>
							</View>
						)}

						<View className='flex flex-col gap-2'>
							{isLoading && (
								<View className='flex justify-center my-2'>
									<Loading inline />
								</View>
							)}
							{!isLoading &&
								cart?.paymentData?.giftCards?.length > 0 &&
								cart?.paymentData?.giftCards
									?.filter(gift => gift.redemptionCode)
									.map(gift => (
										<View
											key={gift.id}
											className='py-2 px-1 flex flex-row items-center justify-between mt-1 gap-5'>
											<View className='flex flex-col'>
												<Text className='text-sm'>
													{formatGiftCardRedemptionCode(gift.redemptionCode)}
												</Text>
												<Text className='text-sm text-primary font-bold'>
													{formatAmountInCents(gift.value)}
												</Text>
											</View>
											<View className='flex flex-row items-center justify-between'>
												<View onClick={() => removeGiftCart(gift.id)}>
													<Text className='text-xs font-bold text-blue-500'>Remover</Text>
												</View>
											</View>
										</View>
									))}
						</View>

						{giftCardValue > 0 && giftCardValue < cart.value && (
							<View>
								<Text className='text-sm font-bold'>{`Pagamento restante de ${formatAmountInCents(cart.value - giftCardValue)}. Por favor, combine com outra forma de pagamento`}</Text>
							</View>
						)}

						{giftCardValue > 0 && giftCardValue >= cart.value && (
							<View>
								<CustomButton
									label='Continuar'
									className='w-full mt-1'
									onClick={() => navigate('CheckoutReview')}
								/>
							</View>
						)}
					</>
				)}
			</View>
		</GroupsWrapper>
	)
}
