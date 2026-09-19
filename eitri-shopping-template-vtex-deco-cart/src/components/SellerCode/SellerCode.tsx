import { useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import { View, Text } from 'eitri-luminus'
import { CustomInput, CustomButton, GenericBox } from 'eitri-shopping-template-vtex-deco-shared'
import { useTranslation } from 'eitri-i18n'
import { useLocalShoppingCart } from '../../providers/LocalCart'
import { getSellerConfig } from '../../services/sellerCodeService'
import { FaRegTrashAlt } from 'react-icons/fa'

interface SellerCodeProps {
	[key: string]: unknown
}

export default function SellerCode(props: SellerCodeProps) {
	const { cart, vendor, setVendor, applySellerCode } = useLocalShoppingCart()
	const { t } = useTranslation()

	const [code, setCode] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [errorText, setErrorText] = useState('')
	const [isEnabled, setIsEnabled] = useState(false)

	useEffect(() => {
		checkConfig()
	}, [])

	const checkConfig = async () => {
		const config = await getSellerConfig()
		setIsEnabled(Boolean(config?.enabled))
	}

	const onPressAdd = async () => {
		if (!code.trim()) return
		setErrorText('')
		setIsLoading(true)
		try {
			if (applySellerCode) {
				await applySellerCode(code.trim().toUpperCase())
			}
		} catch (e: any) {
			if (e?.message === 'NOT_FOUND') {
				setErrorText(t('sellerCode.errorNotFound'))
			} else if (e?.message === 'DISABLED') {
				setIsEnabled(false)
			} else {
				setErrorText(t('sellerCode.errorGeneric'))
			}
		} finally {
			setIsLoading(false)
		}
	}

	const onPressChange = () => {
		if (setVendor) {
			setVendor(null)
		}
		setCode('')
		setErrorText('')
	}

	if (!cart || !isEnabled) return null

	return (
		<View className='px-4'>
			<GenericBox className='p-4'>
				<Text className='text-base font-bold'>{t('sellerCode.txtTitle')}</Text>
				<View className='mt-2 flex gap-8 justify-between items-center'>
					{vendor ? (
						<View className='flex justify-between mt-2 gap-2 items-center w-full'>
							<View className='w-2/3'>
								<CustomInput
									placeholder={t('sellerCode.placeholder')}
									value={`${vendor.name} (${vendor.cod})`}
								/>
							</View>
							<View className='w-1/3'>
								<CustomButton onClick={onPressChange}>
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
									placeholder={t('sellerCode.placeholder')}
									value={code}
									onChange={(e: ChangeEvent<HTMLInputElement>) => { setCode(e.target.value); setErrorText('') }}
								/>
							</View>
							<View className='w-1/3'>
								<CustomButton
									variant='outlined'
									onPress={onPressAdd}
									isLoading={isLoading}
									label={t('sellerCode.labelAdd')}
								/>
							</View>
						</View>
					)}
				</View>
				{errorText ? (
					<View className='mt-1'>
						<Text className='text-error'>{errorText}</Text>
					</View>
				) : null}
				{vendor ? (
					<View className='mt-1'>
						<Text className='text-success'>{t('sellerCode.txtSuccess')}</Text>
					</View>
				) : null}
				<View className='h-[10px]' />
			</GenericBox>
		</View>
	)
}
