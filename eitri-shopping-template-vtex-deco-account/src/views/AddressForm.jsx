import Eitri from 'eitri-bifrost'
import { Page, View } from 'eitri-luminus'
import { useState } from 'react'
import {
	HeaderContentWrapper,
	HeaderReturn,
	BottomInset,
	CustomInput,
	CustomButton,
	Loading,
	GenericBox
} from 'eitri-shopping-monte-carlo-shared'
import { addonUserTappedActiveTabListener } from '../utils/backToTopListener'
import { sendScreenView } from '../services/TrackingService'
import { createAddress, resolvePostalCode, updateAddress } from '../services/AddressService'
import { useTranslation } from 'eitri-i18n'

function PostalCodeInput({ value, onChange, isLoading }) {
	const { t } = useTranslation()
	return (
		<View className=''>
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

function AddressFields({ address, handleAddressChange, touched, errors, onBlur }) {
	const { t } = useTranslation()
	return (
		<>
			<View>
				<CustomInput
					label={t('addressForm.street')}
					placeholder={''}
					value={address?.street || ''}
					onChange={e => handleAddressChange('street', e)}
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
						onChange={e => handleAddressChange('number', e)}
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
						onChange={e => handleAddressChange('complement', e)}
						onBlur={() => onBlur('complement')}
					/>
				</View>
			</View>
			<View>
				<CustomInput
					label={t('addressForm.neighborhood')}
					placeholder={''}
					value={address.neighborhood || ''}
					onChange={e => handleAddressChange('neighborhood', e)}
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
						onChange={e => handleAddressChange('city', e)}
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
						onChange={e => handleAddressChange('state', e)}
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
					onChange={e => handleAddressChange('receiverName', e)}
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

function validateAddress(address, t) {
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

export default function AddressForm(props) {
	const PAGE_NAME = 'Editar/Cadastrar Endereço'
	const { t } = useTranslation()

	const [isLoading, setIsLoading] = useState(false)
	const [address, setAddress] = useState({
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

	const [touched, setTouched] = useState({})
	const errors = validateAddress(address, t)

	useEffect(() => {
		const addressToEdit = props?.location?.state?.address
		if (addressToEdit) {
			setAddress({
				...address,
				...addressToEdit
			})
		}
	}, [])

	useEffect(() => {
		addonUserTappedActiveTabListener()
		sendScreenView('Editar/Cadastrar Endereço', 'AddressForm')
	}, [])

	useEffect(() => {
		const postalCodeDigits = address?.postalCode?.replace(/\D/g, '') || ''

		if (postalCodeDigits.length === 8) {
			submitZipCode(address?.postalCode)
		}
	}, [address?.postalCode])

	const handleAddressChange = (key, e) => {
		const { value } = e.target
		setAddress({
			...address,
			[key]: key === 'receiverName' ? value.replace(/[^a-zA-Z\s]/g, '') : value
		})
	}

	const onChangePostalCodeInput = async e => {
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
			Eitri.navigation.back()
		} catch (e) {
			console.error('Error on submit', e)
			return
		}

		setIsLoading(false)
	}

	const onBlur = field => {
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
						onSubmit={submitZipCode}
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
