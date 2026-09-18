import { useEffect, useState } from 'react'
import { View, Text } from 'eitri-luminus'
import { CustomInput, CustomButton, GenericBox } from 'eitri-shopping-template-vtex-deco-shared'
import { useTranslation } from 'eitri-i18n'
import { useLocalShoppingCart } from '../../providers/LocalCart'
import { FaRegTrashAlt } from 'react-icons/fa'

export default function Coupon() {
	const { cart, addCoupon, removeCoupon } = useLocalShoppingCart()

	const [coupon, setCoupon] = useState('')
	const [appliedCoupon, setAppliedCoupon] = useState('')
	const [invalidCoupon, setInvalidCoupon] = useState(false)
	const [couponTextAlert, setCouponTextAlert] = useState('')
	const [isLoading, setIsLoading] = useState(false)

	const { t } = useTranslation()

	useEffect(() => {
		if (cart?.marketingData?.coupon) {
			setInvalidCoupon(false)
			setAppliedCoupon(cart.marketingData.coupon)

			if (coupon === cart?.marketingData?.coupon) {
				setCouponTextAlert(t('coupon.txtAppliedCoupon'))
			}
		} else {
			const errorMessage = cart?.messages || []
			const couponError = coupon && errorMessage.find(message => message.text?.includes(coupon))

			if (couponError) {
				if (couponError.code === 'couponNotFound') {
					setCouponTextAlert(t('coupon.txtInvalidCoupon'))
				} else if (couponError.code === 'couponExpired') {
					setCouponTextAlert(t('coupon.txtExpiredCoupon'))
				}
				setInvalidCoupon(true)
			} else {
				setInvalidCoupon(false)
				setAppliedCoupon('')
			}
		}
	}, [cart])

	const inputOnChange = (value: string) => {
		setCoupon(value)
	}

	const onPressAddCoupon = () => {
		setIsLoading(true)
		addCoupon?.(coupon)
		setIsLoading(false)
	}

	const onPressRemoveCoupon = () => {
		setCoupon('')
		setCouponTextAlert('')
		removeCoupon?.()
	}

	if (!cart) return null

	return (
		<View className={'px-4'}>
			<GenericBox className='p-4'>
				<Text className='text-base font-bold'>{t('coupon.txtCoupon')}</Text>
				<View className='mt-2 flex gap-2 items-center'>
					{appliedCoupon ? (
						<View className='flex justify-between mt-2 gap-2 items-center w-full'>
							<View className='w-2/3'>
								<CustomInput
									placeholder={t('coupon.labelInsertCode')}
									value={appliedCoupon}
								/>
							</View>
							<View className='w-1/3'>
								<CustomButton onClick={onPressRemoveCoupon}>
									<FaRegTrashAlt
										className='text-primary-content'
										size={20}
									/>
								</CustomButton>
							</View>
						</View>
					) : (
						<View className='flex justify-between mt-2 gap-2 items-center w-full'>
							<View className='w-2/3'>
								<CustomInput
									placeholder={t('coupon.labelInsertCode')}
									value={coupon}
									onChange={e => inputOnChange(e.target.value)}
								/>
							</View>
							<View className='w-1/3'>
								<CustomButton
									variant='outlined'
									onPress={onPressAddCoupon}
									isLoading={isLoading}
									label={t('coupon.txtAdd')}
								/>
							</View>
						</View>
					)}
				</View>
				{couponTextAlert && (
					<View className='mt-1'>
						<Text className={invalidCoupon ? 'text-error' : 'text-black'}>{couponTextAlert}</Text>
					</View>
				)}
				<View className={'h-[10px]'} />
			</GenericBox>
		</View>
	)
}
