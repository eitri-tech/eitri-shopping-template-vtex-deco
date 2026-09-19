import { useEffect, useState } from 'react'
import { View, Image, Loading } from 'eitri-luminus'
import GroupsWrapper from './GroupsWrapper'
import { useLocalShoppingCart } from '../../../providers/LocalCart'
import { navigate } from '../../../services/navigationService'
import GPay from '../../Icons/MethodIcons/GPay'
import GPayBtn from './../../../assets/images/gp-light-pt.svg'
import Eitri from 'eitri-bifrost'
import loadGPaymentData from '../../../services/GPayService'
import type { PaymentGroupProps } from '../../../types/payment'

const VTEX_GPAY_PAYMENT = '900'

/** Subset of the Google Pay PaymentData response this flow reads. */
interface GooglePaymentData {
	paymentMethodData?: {
		description?: string
		info?: { cardNetwork?: string; billingAddress?: unknown; [key: string]: unknown }
		tokenizationData?: { token?: string; [key: string]: unknown }
		[key: string]: unknown
	}
	[key: string]: unknown
}

export default function GooglePay(props: PaymentGroupProps) {
	const { systemGroup, onSelectPaymentMethod } = props
	const { cart, setCardInfo } = useLocalShoppingCart()
	const [loadingGoogleData, setLoadingGoogleData] = useState(false)

	const [gPayAvailable, setGPayAvailable] = useState(false)

	useEffect(() => {
		if (Eitri.canIUse(31)) {
			Eitri.googlePay
				.isAvailable()
				.then((res: unknown) => setGPayAvailable(!!res))
				.catch((err: unknown) => console.error('GooglePay: isAvailable failed', err))
		}
	}, [])

	const onSelectThisGroup = async () => {
		if (!cart || typeof onSelectPaymentMethod !== 'function') return
		try {
			setLoadingGoogleData(true)

			const paymentSystem = systemGroup?.paymentSystems?.[0]

			const googlePaymentData = (await loadGPaymentData()) as GooglePaymentData | undefined

			const cardNetWorkLabel = googlePaymentData?.paymentMethodData?.info?.cardNetwork
			const paymentSystemWallet = cardNetWorkLabel
				? (cart.paymentData?.paymentSystems ?? []).find(
						ps => ps?.name?.toLowerCase() === cardNetWorkLabel.toLowerCase()
					)
				: undefined

			const metadata = {
				walletId: 'googlePay',
				paymentData: {
					assuranceDetails: {
						cardHolderAuthenticated: false,
						accountVerified: true
					},
					billingAddress: googlePaymentData?.paymentMethodData?.info?.billingAddress,
					cardNetwork: paymentSystemWallet?.stringId,
					token: googlePaymentData?.paymentMethodData?.tokenizationData?.token
				}
			}

			setCardInfo?.({
				metadata: JSON.stringify(metadata)
			})

			await onSelectPaymentMethod([
				{
					paymentSystem: VTEX_GPAY_PAYMENT,
					installmentsInterestRate: 0,
					installments: 1,
					referenceValue: cart.value,
					value: cart.value,
					hasDefaultBillingAddress: true
				}
			])

			navigate('Installments', { paymentSystem, description: googlePaymentData?.paymentMethodData?.description })
		} catch (e) {
			console.error('GooglePay: onSelectThisGroup failed', e)
		}
		setLoadingGoogleData(false)
	}

	if (!gPayAvailable) {
		return null
	}

	return (
		<GroupsWrapper
			title='Google Pay'
			icon={<GPay />}
			onPress={onSelectThisGroup}>
			<View onClick={onSelectThisGroup}>
				<View className='flex flex-row justify-center border border-black rounded-full p-3'>
					{loadingGoogleData ? <Loading /> : <Image src={GPayBtn} />}
				</View>
			</View>
		</GroupsWrapper>
	)
}
