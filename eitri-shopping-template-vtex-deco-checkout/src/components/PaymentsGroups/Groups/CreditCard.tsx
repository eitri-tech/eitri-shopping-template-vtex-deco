import { useEffect, useState } from 'react'
import type { ChangeEvent, MouseEvent } from 'react'
import { useLocalShoppingCart } from '../../../providers/LocalCart'
import GroupsWrapper from './GroupsWrapper'
import Card from '../../Icons/MethodIcons/Card'
import { Text, View } from 'eitri-luminus'
import CardIcon from '../../Icons/CardIcons/CardIcon'
import { navigate } from '../../../services/navigationService'
import { useCustomer } from '../../../providers/Customer'
import { CustomButton, CustomInput, TrackingService } from 'eitri-shopping-template-vtex-deco-shared'
import { isLoggedIn, removeAccount } from '../../../services/CustomerService'
import OtpLogin from '../../OtpLogin/OtpLogin'
import type { PaymentGroupProps } from '../../../types/payment'
import type { VtexAvailableAccount } from '../../../types/vtex'

export default function CreditCard(props: PaymentGroupProps) {
	const { onSelectPaymentMethod, systemGroup } = props

	const { cart, setCardInfo, cardInfo } = useLocalShoppingCart()
	const { checkoutProfile, getCustomer } = useCustomer()

	const [availableAccounts, setAvailableAccounts] = useState<VtexAvailableAccount[]>([])
	const [accountSelected, setAccountSelected] = useState<VtexAvailableAccount | null>(null)

	const [accountToRemove, setAccountToRemove] = useState<VtexAvailableAccount | null>(null)
	const [otpLogin, setOtpLogin] = useState(false)
	const [loadingRemoveCard, setLoadingRemoveCard] = useState(false)

	const assetUniqueCards = (accounts: VtexAvailableAccount[]): VtexAvailableAccount[] => {
		const cards: VtexAvailableAccount[] = []
		accounts.forEach(account => {
			if (!cards.some(card => card.cardNumber === account.cardNumber)) {
				cards.push(account)
			}
		})
		return cards
	}

	useEffect(() => {
		if (loadingRemoveCard) return
		const accounts = checkoutProfile?.availableAccounts || cart?.paymentData?.availableAccounts
		if (accounts) {
			setAvailableAccounts(assetUniqueCards(accounts))
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [checkoutProfile, cart])

	const setPaymentSystem = async () => {
		if (!cart || typeof onSelectPaymentMethod !== 'function') return
		const paymentSystem = systemGroup?.paymentSystems?.find(
			system => system.stringId === accountSelected?.paymentSystem
		)
		if (!paymentSystem) return

		await onSelectPaymentMethod([
			{
				paymentSystem: paymentSystem.id,
				installmentsInterestRate: 0,
				installments: 1,
				referenceValue: cart.value,
				value: cart.value,
				hasDefaultBillingAddress: true
			}
		])
		TrackingService.addPaymentInfoEvent(cart, paymentSystem.name)
		navigate('Installments', { paymentSystem })
	}

	const selectCart = (account: VtexAvailableAccount) => {
		setAccountSelected(account)
		setCardInfo?.(account)
	}

	const addNewCard = () => {
		navigate('AddCardForm')
	}

	const removeAccountConfirm = (e: MouseEvent<HTMLElement> | undefined, account: VtexAvailableAccount) => {
		e?.stopPropagation()
		setAccountToRemove(account)
	}

	const removeUserAccount = async (isRetrying?: boolean) => {
		try {
			setLoadingRemoveCard(true)
			setOtpLogin(false)
			const accounts = checkoutProfile?.availableAccounts || cart?.paymentData?.availableAccounts || []

			// Tem conta com cartão repetido... remove todos os accounts com o cartão
			const accountsToRemove = accounts.filter(account => account.cardNumber === accountToRemove?.cardNumber)

			setAvailableAccounts(prev => prev.filter(account => account.cardNumber !== accountToRemove?.cardNumber))

			// Avoid infinite loop
			if (!(await isLoggedIn())) {
				if (!isRetrying) {
					setOtpLogin(true)
				}
				console.log('nao logado, tenta logar com o otp')
				return
			}

			setAccountToRemove(null)

			for (const acc of accountsToRemove) {
				try {
					// Bug fix: `removeAccount` was destructured from `useLocalShoppingCart()`, where it
					// never existed — every removal silently threw (swallowed by this try/catch) while
					// the optimistic UI update above still hid the card, so it reappeared on next sync.
					// The real call lives at Vtex.customer.removeAccount, wrapped in CustomerService.
					if (acc.accountId) await removeAccount(acc.accountId)
				} catch (error) {
					console.error('Erro ao remover conta', error)
				}
			}

			await getCustomer?.()
			setLoadingRemoveCard(false)
		} catch (e) {
			setLoadingRemoveCard(false)
		}
	}

	return (
		<>
			<GroupsWrapper
				title='Cartão de Crédito'
				icon={<Card />}>
				{availableAccounts.length > 0 && (
					<View className='flex flex-col gap-3'>
						{availableAccounts.map(account => (
							<View
								key={account.accountId}
								onClick={() => selectCart(account)}>
								<View className='flex flex-row items-top justify-between'>
									<View className='flex flex-row gap-2 items-top'>
										<CardIcon
											width={'30px'}
											iconKey={account?.paymentSystemName}
										/>
										<View className='flex flex-col'>
											<View className='flex items-center gap-2'>
												<Text className='text-sm font-bold'>{`${account?.paymentSystemName ?? ''}`}</Text>
												<View
													onClick={(e?: MouseEvent<HTMLElement>) => removeAccountConfirm(e, account)}
													className='text-xs text-primary font-semibold'>
													(Remover)
												</View>
											</View>
											<Text className='text-sm'>{`final ${account?.cardNumber?.replaceAll('*', '') ?? ''}`}</Text>
										</View>
									</View>

									<View className='flex flex-row gap-2 items-center'>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											width='24'
											height='24'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='2'
											strokeLinecap='round'
											strokeLinejoin='round'
											className='text-primary'>
											<polyline points='9 18 15 12 9 6'></polyline>
										</svg>
									</View>
								</View>
							</View>
						))}
						{accountSelected && (
							<View className='flex flex-row gap-2 items-end mt-2'>
								<View className='w-2/4'>
									<CustomInput
										inputMode='numeric'
										variant='mask'
										mask='9999'
										label='Cód. Segurança'
										placeholder={'Cód. Segurança'}
										value={cardInfo?.validationCode || ''}
										onChange={(e: ChangeEvent<HTMLInputElement>) =>
											setCardInfo?.({ ...cardInfo, validationCode: e.target.value })
										}
									/>
								</View>
								<View className='w-2/4'>
									<CustomButton
										onClick={setPaymentSystem}
										disabled={!cardInfo?.validationCode || (cardInfo?.validationCode?.length ?? 0) < 3}
										label='Continuar'
									/>
								</View>
							</View>
						)}
					</View>
				)}

				<View className='border-b my-4' />

				<View onClick={addNewCard}>
					<Text className='text-primary font-bold'>+ novo cartão</Text>
				</View>
			</GroupsWrapper>

			{accountToRemove && (
				<View
					className='z-[9999] !bg-black/70 !opacity-100 fixed inset-0 flex items-center justify-center'
					onClick={() => setAccountToRemove(null)}>
					<View
						onClick={(e?: MouseEvent<HTMLElement>) => e?.stopPropagation()}
						className='bg-white max-w-[80%] max-h-[70vh] overflow-y-auto pointer-events-auto p-4'>
						<Text className='text-lg font-semibold'>
							{`Deseja remover o cartão final ${accountToRemove?.cardNumber?.replaceAll('*', '') ?? ''}`}
						</Text>

						<View className='flex flex-col mt-5 gap-3'>
							<CustomButton
								label='Sim'
								onClick={() => removeUserAccount()}
							/>
							<CustomButton
								outlined
								label='Não'
								onClick={() => setAccountToRemove(null)}
							/>
						</View>
					</View>
				</View>
			)}

			<OtpLogin
				open={otpLogin}
				onClose={() => setOtpLogin(false)}
				onLogged={() => removeUserAccount(true)}
			/>
		</>
	)
}
