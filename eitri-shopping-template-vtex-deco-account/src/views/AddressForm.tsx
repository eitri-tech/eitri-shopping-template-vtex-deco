import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import Eitri from 'eitri-bifrost'
import { Page, View, Text } from 'eitri-luminus'
import { HeaderContentWrapper, HeaderReturn, BottomInset, CustomInput, CustomButton, Loading, GenericBox } from 'eitri-shopping-template-vtex-deco-shared'
import { addonUserTappedActiveTabListener } from '../utils/backToTopListener'
import { sendScreenView } from '../services/TrackingService'
import { createAddress, resolvePostalCode, updateAddress } from '../services/AddressService'
import { useTranslation } from 'eitri-i18n'
import type { RouteProps } from '../types/route'
import type { VtexAddress } from '../types/vtex'

interface AddressFormValues {
	postalCode: string
	street: string
	neighborhood: string
	receiverName: string
	state: string
	country: string
	geoCoordinates: number[]
	number: string
	complement: string
	reference: string
	addressType: string
	addressId?: string
	// Never given an initial value in the original state literal — filled in only after
	// `submitZipCode` resolves the postal code. Kept optional to preserve that behavior.
	city?: string
	[key: string]: unknown
}

type AddressErrors = Record<string, string>
type AddressTouched = Record<string, boolean>

interface PostalCodeInputProps {
	value?: string
	onChange: (e: ChangeEvent<HTMLInputElement>) => void
	isLoading?: boolean
}

function PostalCodeInput(props: PostalCodeInputProps) {
	const { value, onChange, isLoading } = props
	const { t } = useTranslation()
	return (
		<View>
			<CustomInput
				label={t('addressForm.postalCode')}
				inputMode='numeric'
				placeholder='12345-678'
				value={value}
				onChange={onChange}
				autoFocus={true}
				variant='mask'
				mask='99999-999'
				disabled={isLoading}
			/>
		</View>
	)
}

interface AddressFieldsProps {
	address: AddressFormValues
	handleAddressChange: (key: keyof AddressFormValues, e: ChangeEvent<HTMLInputElement>) => void
	touched: AddressTouched
	errors: AddressErrors
	onBlur: (field: string) => void
}

function AddressFields(props: AddressFieldsProps) {
	const { address, handleAddressChange, touched, errors, onBlur } = props
	const { t } = useTranslation()
	return (
		<>
			<View>
				<CustomInput
					label={t('addressForm.street')}
					placeholder={''}
					value={address?.street || ''}
					onChange={(e: ChangeEvent<HTMLInputElement>) => handleAddressChange('street', e)}
					className={'!outline-none w-full' + (errors.street && touched.street ? 'border-red-500' : '')}
					onBlur={() => onBlur('street')}
				/>
				{errors.street && touched.street && <Text className='text-xs text-red-500'>{errors.street}</Text>}
			</View>
			<View className='flex gap-2'>
				<View className='w-1/2'>
					<CustomInput
						label={t('addressForm.number')}
						placeholder={''}
						value={address?.number || ''}
						onChange={(e: ChangeEvent<HTMLInputElement>) => handleAddressChange('number', e)}
						className={errors.number && touched.number ? 'border-red-500' : ''}
						onBlur={() => onBlur('number')}
					/>
					{errors.number && touched.number && <Text className='text-xs text-red-500'>{errors.number}</Text>}
				</View>
				<View className='w-1/2'>
					<CustomInput
						label={t('addressForm.complement')}
						placeholder={''}
						value={address?.complement || ''}
						onChange={(e: ChangeEvent<HTMLInputElement>) => handleAddressChange('complement', e)}
						onBlur={() => onBlur('complement')}
					/>
				</View>
			</View>
			<View>
				<CustomInput
					label={t('addressForm.neighborhood')}
					placeholder={''}
					value={address.neighborhood || ''}
					onChange={(e: ChangeEvent<HTMLInputElement>) => handleAddressChange('neighborhood', e)}
					className={
						'w-full !outline-none' + (errors.neighborhood && touched.neighborhood ? 'border-red-500' : '')
					}
					onBlur={() => onBlur('neighborhood')}
				/>
				{errors.neighborhood && touched.neighborhood && (
					<Text className='text-xs text-red-500'>{errors.neighborhood}</Text>
				)}
			</View>
			<View className='flex gap-2'>
				<View className='w-1/2'>
					<CustomInput
						label={t('addressForm.city')}
						placeholder={''}
						value={address.city || ''}
						onChange={(e: ChangeEvent<HTMLInputElement>) => handleAddressChange('city', e)}
						className={errors.city && touched.city ? 'border-red-500' : ''}
						onBlur={() => onBlur('city')}
					/>
					{errors.city && touched.city && <Text className='text-xs text-red-500'>{errors.city}</Text>}
				</View>
				<View className='w-1/2'>
					<CustomInput
						label={t('addressForm.state')}
						placeholder={''}
						value={address?.state || ''}
						onChange={(e: ChangeEvent<HTMLInputElement>) => handleAddressChange('state', e)}
						className={errors.state && touched.state ? 'border-red-500' : ''}
						onBlur={() => onBlur('state')}
					/>
					{errors.state && touched.state && <Text className='text-xs text-red-500'>{errors.state}</Text>}
				</View>
			</View>
			<View>
				<CustomInput
					label={t('addressForm.recipient')}
					placeholder={''}
					value={address.receiverName || ''}
					onChange={(e: ChangeEvent<HTMLInputElement>) => handleAddressChange('receiverName', e)}
					className={errors.receiverName && touched.receiverName ? 'border-red-500' : ''}
					onBlur={() => onBlur('addressName')}
				/>
				{errors.receiverName && touched.receiverName && (
					<Text className='text-xs text-red-500'>{errors.receiverName}</Text>
				)}
			</View>
		</>
	)
}

function validateAddress(address: AddressFormValues, t: (key: string) => string): AddressErrors {
	return {
		postalCode: !address.postalCode ? t('addressForm.validatePostalCode') : '',
		street: !address.street ? t('addressForm.validateStreet') : '',
		neighborhood: !address.neighborhood ? t('addressForm.validateNeighborhood') : '',
		city: !address.city ? t('addressForm.validateCity') : '',
		state: !address.state ? t('addressForm.validateState') : '',
		number: !address.number ? t('addressForm.validateNumber') : '',
		receiverName: !address.receiverName ? t('addressForm.validateRecipient') : ''
	}
}

interface AddressFormState {
	address?: VtexAddress
}

export default function AddressForm(props: RouteProps<AddressFormState>) {
	const PAGE_NAME = 'Editar/Cadastrar Endereço'
	const { t } = useTranslation()

	const [isLoading, setIsLoading] = useState(false)
	const [address, setAddress] = useState<AddressFormValues>({
		postalCode: '',
		street: '',
		neighborhood: '',
		receiverName: '',
		state: '',
		country: '',
		geoCoordinates: [],
		number: '',
		complement: '',
		reference: '',
		addressType: 'residential'
	})

	const [touched, setTouched] = useState<AddressTouched>({})
	const errors = validateAddress(address, t)

	useEffect(() => {
		const addressToEdit = props?.location?.state?.address
		if (addressToEdit) {
			setAddress(prev => ({
				...prev,
				...addressToEdit
			}))
		}
	}, [])

	useEffect(() => {
		addonUserTappedActiveTabListener()
		sendScreenView('Editar/Cadastrar Endereço', 'AddressForm')
	}, [])

	useEffect(() => {
		const postalCodeDigits = address?.postalCode?.replace(/\D/g, '') || ''

		if (postalCodeDigits.length === 8) {
			submitZipCode()
		}
	}, [address?.postalCode])

	const handleAddressChange = (key: keyof AddressFormValues, e: ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target
		setAddress({
			...address,
			[key]: key === 'receiverName' ? value.replace(/[^a-zA-Z\s]/g, '') : value
		})
	}

	const onChangePostalCodeInput = async (e: ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target
		setAddress({ ...address, postalCode: value })
	}

	const submitZipCode = async () => {
		try {
			if (!address.postalCode) return

			setIsLoading(true)
			const { street, neighborhood, city, state, country, geoCoordinates } = await resolvePostalCode(
				address.postalCode
			)

			setAddress({
				...address,
				street,
				neighborhood,
				city,
				state,
				country,
				geoCoordinates
			})

			setIsLoading(false)
		} catch (e) {
			setIsLoading(false)
		}
	}

	const submit = async () => {
		try {
			setIsLoading(true)

			if (address.addressId) {
				const { addressId, ...rest } = address
				await updateAddress(address.addressId, rest)
			} else {
				await createAddress(address)
			}
			Eitri.navigation.back(1)
		} catch (e) {
			console.error('Error on submit', e)
			return
		}

		setIsLoading(false)
	}

	const onBlur = (field: string) => {
		setTouched(prev => ({ ...prev, [field]: true }))
	}

	const isValidAddress = () => {
		return !Object.values(validateAddress(address, t)).some(Boolean)
	}

	return (
		<Page title={PAGE_NAME}>
			<HeaderContentWrapper>
				<HeaderReturn />
			</HeaderContentWrapper>

			<Loading
				isLoading={isLoading}
				fullScreen
			/>

			<View className={'p-4'}>
				<GenericBox className='flex flex-col gap-2 p-4'>
					<PostalCodeInput
						value={address?.postalCode}
						onChange={onChangePostalCodeInput}
						isLoading={isLoading}
					/>

					<AddressFields
						address={address}
						handleAddressChange={handleAddressChange}
						touched={touched}
						errors={errors}
						onBlur={onBlur}
					/>

					<CustomButton
						disabled={!isValidAddress()}
						className={'mt-4'}
						label={t('addressForm.save')}
						onClick={submit}
					/>
				</GenericBox>
			</View>

			<BottomInset />
		</Page>
	)
}
