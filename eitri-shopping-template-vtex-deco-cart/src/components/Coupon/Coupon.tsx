import { useEffect, useState } from 'react'
import { View, Text } from 'eitri-luminus'
import { CustomInput, CustomButton, GenericBox } from 'eitri-shopping-template-vtex-deco-shared'
import { useTranslation } from 'eitri-i18n'
import { useLocalShoppingCart } from '../../providers/LocalCart'

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
		addCoupon(coupon)
		setIsLoading(false)
	}

	const onPressRemoveCoupon = () => {
		setCoupon('')
		setCouponTextAlert('')
		removeCoupon()
	}

	if (!cart) return null

	return (
		<View className={'px-4'}>
			<GenericBox className='p-4'>
				<Text className='text-base font-bold'>{t('coupon.txtCoupon')}</Text>
				<View className='mt-2 flex gap-8 justify-between items-center'>
					{appliedCoupon ? (
						<>
							<View className='flex my-2 py-4 px-2 border border-neutral-300 rounded-lg w-[90%]'>
								<Text>{appliedCoupon}</Text>
							</View>
							<CustomButton
								onClick={onPressRemoveCoupon}
								className='px-4'>
								<svg
									width='30px'
									height='30px'
									viewBox='0 0 25 24'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'>
									<g clipPath='url(#clip0_4343_2758)'>
										<path
											d='M19.5221 16.0354L20.1214 16.0639L19.5221 16.0354ZM5.47788 16.0354L4.87855 16.0639L5.47788 16.0354ZM3.5 5.4C3.16863 5.4 2.9 5.66863 2.9 6C2.9 6.33137 3.16863 6.6 3.5 6.6V5.4ZM21.5 6.6C21.8314 6.6 22.1 6.33137 22.1 6C22.1 5.66863 21.8314 5.4 21.5 5.4V6.6ZM8.22299 3.08819C8.06459 3.37925 8.17213 3.74361 8.46319 3.90201C8.75425 4.06041 9.11861 3.95287 9.27701 3.66181L8.22299 3.08819ZM8.92934 3.04546L9.45635 3.33227L9.45635 3.33227L8.92934 3.04546ZM16.0707 3.04546L15.5436 3.33227V3.33227L16.0707 3.04546ZM15.723 3.66181C15.8814 3.95287 16.2457 4.06041 16.5368 3.90201C16.8279 3.74361 16.9354 3.37925 16.777 3.08819L15.723 3.66181ZM15.7458 2.63607L16.145 2.18807V2.18807L15.7458 2.63607ZM9.25416 2.63607L9.65328 3.08407L9.65328 3.08407L9.25416 2.63607ZM19.4007 5.97146L18.9228 16.0069L20.1214 16.0639L20.5993 6.02854L19.4007 5.97146ZM13.5289 21.15H11.4711V22.35H13.5289V21.15ZM6.0772 16.0069L5.59932 5.97146L4.40068 6.02854L4.87855 16.0639L6.0772 16.0069ZM11.4711 21.15C10.1007 21.15 9.13195 21.1488 8.3947 21.0515C7.67463 20.9566 7.26085 20.7792 6.95434 20.4869L6.12624 21.3554C6.68895 21.892 7.38671 22.129 8.2378 22.2412C9.07171 22.3512 10.1338 22.35 11.4711 22.35V21.15ZM4.87855 16.0639C4.94217 17.3997 4.99146 18.4606 5.14098 19.2884C5.29357 20.1332 5.56352 20.8189 6.12624 21.3554L6.95434 20.4869C6.64783 20.1947 6.45097 19.7898 6.32187 19.0751C6.18968 18.3433 6.14238 17.3757 6.0772 16.0069L4.87855 16.0639ZM18.9228 16.0069C18.8576 17.3757 18.8103 18.3433 18.6781 19.0751C18.549 19.7898 18.3522 20.1947 18.0457 20.4869L18.8738 21.3554C19.4365 20.8189 19.7064 20.1332 19.859 19.2884C20.0085 18.4606 20.0578 17.3997 20.1214 16.0639L18.9228 16.0069ZM13.5289 22.35C14.8662 22.35 15.9283 22.3512 16.7622 22.2412C17.6133 22.129 18.3111 21.892 18.8738 21.3554L18.0457 20.4869C17.7392 20.7792 17.3254 20.9566 16.6053 21.0515C15.8681 21.1488 14.8993 21.15 13.5289 21.15V22.35ZM3.5 6.6H5V5.4H3.5V6.6ZM5 6.6H20V5.4H5V6.6ZM20 6.6H21.5V5.4H20V6.6ZM10.2679 2.85H14.7321V1.65H10.2679V2.85ZM9.27701 3.66181L9.45635 3.33227L8.40233 2.75865L8.22299 3.08819L9.27701 3.66181ZM15.5436 3.33227L15.723 3.66181L16.777 3.08819L16.5977 2.75865L15.5436 3.33227ZM15.3467 3.08407C15.4262 3.15484 15.4928 3.23881 15.5436 3.33227L16.5977 2.75865C16.4808 2.54381 16.3276 2.35078 16.145 2.18807L15.3467 3.08407ZM9.45635 3.33227C9.50721 3.23881 9.57383 3.15484 9.65328 3.08407L8.85503 2.18807C8.6724 2.35078 8.51925 2.54381 8.40233 2.75865L9.45635 3.33227ZM14.7321 2.85C14.9588 2.85 15.1775 2.9333 15.3467 3.08407L16.145 2.18807C15.756 1.8415 15.2531 1.65 14.7321 1.65V2.85ZM10.2679 1.65C9.74687 1.65 9.24405 1.8415 8.85503 2.18807L9.65328 3.08407C9.8225 2.9333 10.0412 2.85 10.2679 2.85V1.65Z'
											stroke='#E8808A'
										/>
									</g>
									<defs>
										<clipPath id='clip0_4343_2758'>
											<rect
												width='24'
												height='24'
												fill='white'
												transform='translate(0.5)'
											/>
										</clipPath>
									</defs>
								</svg>
							</CustomButton>
						</>
					) : (
						<>
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
						</>
					)}
				</View>
				{couponTextAlert && (
					<View className='mt-1'>
						<Text className={invalidCoupon ? 'text-error' : 'text-success'}>{couponTextAlert}</Text>
					</View>
				)}
				<View className={'h-[10px]'} />
			</GenericBox>
		</View>
	)
}
