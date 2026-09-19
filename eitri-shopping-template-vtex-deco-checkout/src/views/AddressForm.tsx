import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import Eitri from 'eitri-bifrost'
import { Page, View, Text } from 'eitri-luminus'
import { useLocalShoppingCart } from '../providers/LocalCart'
import { useTranslation } from 'eitri-i18n'
import { resolvePostalCode } from '../services/freigthService'
import { navigate, requestLogin } from '../services/navigationService'
import FixedBottom from '../components/FixedBottom/FixedBottom'
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
import type { RouteProps } from '../types/route'

interface AddressFormState {
	postalCode: string
	street: string
	neighborhood: string
	city: string
	state: string
	country: string
	geoCoordinates: number[]
	number: string
	complement: string
	reference: string
	addressQuery: string
	addressType: string
	receiverName: string
	isDisposable: boolean
	addressId?: string
	[key: string]: unknown
}

interface AddressErrors {
	postalCode: string
	street: string
	neighborhood: string
	city: string
	state: string
	receiverName: string
	number: string
}

// The real i18next TFunction's overloads are too specific to satisfy structurally here without
// importing its types — callers pass the real `t` cast to this loose shape instead.
interface TranslateFn {
	(key: string, optionsOrDefault?: unknown): string
}

interface PostalCodeInputProps {
	value?: string
	onChange: (e: ChangeEvent<HTMLInputElement>) => void
	isLoading: boolean
	t: TranslateFn
	error?: string
	touched?: boolean
	onBlur: () => void
}

function PostalCodeInput(props: PostalCodeInputProps) {
	const { value, onChange, isLoading, t, error, touched, onBlur } = props
	return (
		<View className='flex flex-col gap-1 w-full'>
			<View className='flex justify-between gap-2 w-full items-end'>
				<CustomInput
					label={t('addNewShippingAddress.txtZipCode', 'Insira seu CEP')}
					inputMode='numeric'
					placeholder='12345-678'
					value={value}
					onChange={onChange}
					autoFocus={true}
					variant='mask'
					mask='99999-999'
					disabled={isLoading}
					className={error && touched ? 'border-red-500' : ''}
					onBlur={onBlur}
				/>
			</View>
			{error && touched && <Text className='text-xs text-red-500 ml-1'>{error}</Text>}
		</View>
	)
}

type TouchableField = keyof AddressErrors | 'complement'

interface AddressFieldsProps {
	address: AddressFormState
	handleAddressChange: (key: keyof AddressFormState, e: ChangeEvent<HTMLInputElement>) => void
	t: TranslateFn
	touched: Partial<Record<TouchableField, boolean>>
	errors: AddressErrors
	onBlur: (field: TouchableField) => void
}

function AddressFields(props: AddressFieldsProps) {
	const { address, handleAddressChange, t, touched, errors, onBlur } = props
	return (
		<>
			<View>
				<CustomInput
					label={t('addNewShippingAddress.frmStreet')}
					placeholder={''}
					value={address?.street || ''}
					onChange={e => handleAddressChange('street', e)}
					className={errors.street && touched.street ? 'border-red-500' : ''}
					onBlur={() => onBlur('street')}
				/>
				{errors.street && touched.street && <Text className='text-xs text-red-500'>{errors.street}</Text>}
			</View>
			<View className='flex gap-4'>
				<View className='w-1/2'>
					<CustomInput
						label={t('addNewShippingAddress.frmNumber')}
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
						label={t('addNewShippingAddress.frmComplement')}
						placeholder={''}
						value={address?.complement || ''}
						onChange={e => handleAddressChange('complement', e)}
						onBlur={() => onBlur('complement')}
					/>
				</View>
			</View>
			<View>
				<CustomInput
					label={t('addNewShippingAddress.frmNeighborhood')}
					placeholder={''}
					value={address?.neighborhood || ''}
					onChange={e => handleAddressChange('neighborhood', e)}
					className={errors.neighborhood && touched.neighborhood ? 'border-red-500' : ''}
					onBlur={() => onBlur('neighborhood')}
				/>
				{errors.neighborhood && touched.neighborhood && (
					<Text className='text-xs text-red-500'>{errors.neighborhood}</Text>
				)}
			</View>
			<View className='flex gap-4'>
				<View className='w-1/2'>
					<CustomInput
						label={t('addNewShippingAddress.frmCity')}
						placeholder={''}
						value={address?.city || ''}
						onChange={e => handleAddressChange('city', e)}
						className={errors.city && touched.city ? 'border-red-500' : ''}
						onBlur={() => onBlur('city')}
					/>
					{errors.city && touched.city && <Text className='text-xs text-red-500'>{errors.city}</Text>}
				</View>
				<View className='w-1/2'>
					<CustomInput
						label={t('addNewShippingAddress.frmState')}
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
					placeholder={t('addNewShippingAddress.frmReceiveName')}
					label={t('addNewShippingAddress.frmReceiveName')}
					value={address?.receiverName || ''}
					onChange={e => handleAddressChange('receiverName', e)}
					className={errors.receiverName && touched.receiverName ? 'border-red-500' : ''}
					onBlur={() => onBlur('receiverName')}
				/>
				{errors.receiverName && touched.receiverName && (
					<Text className='text-xs text-red-500'>{errors.receiverName}</Text>
				)}
			</View>
		</>
	)
}

function validateAddress(address: AddressFormState, t: TranslateFn): AddressErrors {
	const postalCodeDigits = address.postalCode?.replace(/\D/g, '') || ''
	return {
		postalCode: !address.postalCode
			? t('addNewShippingAddress.errorPostalCode')
			: postalCodeDigits.length !== 8
				? t('addNewShippingAddress.errorPostalCodeInvalid', 'CEP deve ter 8 dígitos')
				: '',
		street: !address.street ? t('addNewShippingAddress.errorStreet') : '',
		neighborhood: !address.neighborhood ? t('addNewShippingAddress.errorNeighborhood') : '',
		city: !address.city ? t('addNewShippingAddress.errorCity') : '',
		state: !address.state ? t('addNewShippingAddress.errorState') : '',
		receiverName: !address.receiverName ? t('addNewShippingAddress.errorReceiverName') : '',
		number: !address.number ? t('addNewShippingAddress.errorNumber') : ''
	}
}

export default function AddressForm(props: RouteProps<{ addressId?: string }>) {
	const PAGE_NAME = 'Adicionar endereço - checkout'

	const { cart, cartIsLoading, setLogisticInfo, startCart } = useLocalShoppingCart()
	const { t } = useTranslation()

	const [addressId, setAddressId] = useState<string | undefined>(props.location?.state?.addressId)
	const [isLoading, setIsLoading] = useState(false)
	const [addressError, setAddressError] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [address, setAddress] = useState<AddressFormState>({
		postalCode: '',
		street: '',
		neighborhood: '',
		city: '',
		state: '',
		country: 'BRA',
		geoCoordinates: [],
		number: '',
		complement: '',
		reference: '',
		addressQuery: '',
		addressType: 'residential',
		receiverName: cart?.clientProfileData?.firstName
			? `${cart?.clientProfileData?.firstName} ${cart?.clientProfileData?.lastName ?? ''}`
			: '',
		isDisposable: false
	})
	const [touched, setTouched] = useState<Partial<Record<TouchableField, boolean>>>({})

	useEffect(() => {
		TrackingService.sendScreenView('Adicionar endereço - checkout', 'AddressFormCheckout')
	}, [])

	useEffect(() => {
		if (addressId) {
			init(addressId)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [addressId])

	useEffect(() => {
		const postalCodeDigits = address?.postalCode?.replace(/\D/g, '') || ''

		if (postalCodeDigits.length === 8) {
			submitZipCode(address?.postalCode)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address?.postalCode])

	const errors = useMemo(() => validateAddress(address, t as unknown as TranslateFn), [address, t])

	const init = async (targetAddressId: string) => {
		try {
			if (!cart?.canEditData) {
				await requestLogin()
				const newCart = await startCart?.()
				const _address = newCart?.shippingData?.selectedAddresses?.find(
					selectedAddress => selectedAddress.addressId === targetAddressId
				)
				// Merging a partial VTEX address into the stricter local form shape — VtexAddress
				// fields are all optional (real payloads vary by address type), the local form
				// always needs a full string-keyed shape to render inputs safely.
				setAddress(prev => ({ ...prev, ...(_address ?? {}) }) as AddressFormState)
			} else {
				const _address = cart?.shippingData?.selectedAddresses?.find(
					selectedAddress => selectedAddress.addressId === targetAddressId
				)
				if (!_address && cart?.shippingData?.selectedAddresses?.[0]?.addressId) {
					setAddressId(cart.shippingData.selectedAddresses[0].addressId)
					return
				}
				setAddress(prev => ({ ...prev, ...(_address ?? {}) }) as AddressFormState)
			}
		} catch (e) {
			console.error('Error loading address', e)
			Eitri.navigation.back(1)
		}
	}

	const handleAddressChange = useCallback((key: keyof AddressFormState, e: ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target
		setAddress(prev => ({
			...prev,
			[key]: key === 'receiverName' ? value.replace(/[^a-zA-Z\s]/g, '') : value
		}))
	}, [])

	const onChangePostalCodeInput = async (e: ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target
		setAddress(prev => ({ ...prev, postalCode: value }))
	}

	const submitZipCode = async (postalCode: string) => {
		try {
			if (!postalCode) return
			setIsLoading(true)
			const { street, neighborhood, city, state, country, geoCoordinates } = await resolvePostalCode(postalCode)
			setAddress(prev => ({
				...prev,
				street: street ?? '',
				neighborhood: neighborhood ?? '',
				city: city ?? '',
				state: state ?? '',
				country: country ?? prev.country,
				geoCoordinates: geoCoordinates ?? []
			}))
			setIsLoading(false)
			// Foco no campo número após buscar o CEP
			setTimeout(() => {
				document.getElementById('numberField')?.focus()
			}, 100)
		} catch (e) {
			console.error('Error resolving postal code', e)
			setIsLoading(false)
		}
	}

	const submit = async () => {
		if (isSubmitting) return
		setIsSubmitting(true)
		setAddressError('')
		try {
			if (addressId) {
				const newSelectedAddresses = cart?.shippingData?.selectedAddresses?.map(selectedAddress => {
					if (selectedAddress.addressId === addressId) {
						return address
					}
					return selectedAddress
				})

				const payload = {
					logisticsInfo: cart?.shippingData?.logisticsInfo,
					clearAddressIfPostalCodeNotFound: false,
					selectedAddresses: newSelectedAddresses
				}
				await setLogisticInfo?.(payload)
			} else {
				const payload = {
					address,
					clearAddressIfPostalCodeNotFound: false
				}
				await setLogisticInfo?.(payload)
			}
			navigate('FreightResolver', {}, true)
		} catch (e) {
			const status = (e as { response?: { status?: number } } | undefined)?.response?.status
			if (status === 400) {
				setAddressError(t('addNewShippingAddress.errorAddress'))
				console.error('Error on submit', e)
				return
			}
			setAddressError(t('addNewShippingAddress.errorDefault'))
			setTimeout(() => setAddressError(''), 8000)
		} finally {
			setIsSubmitting(false)
		}
	}

	const onBlur = (field: TouchableField) => {
		setTouched(prev => ({ ...prev, [field]: true }))
	}

	const isValidAddress = useMemo(() => {
		return !Object.values(errors).some(Boolean)
	}, [errors])

	return (
		<Page title={PAGE_NAME}>
			<HeaderContentWrapper>
				<HeaderReturn />
				<HeaderText text={t('addNewShippingAddress.title')} />
			</HeaderContentWrapper>

			<Loading
				fullScreen
				isLoading={!!cartIsLoading}
			/>

			<View className='flex flex-col gap-2 p-4 m-4 bg-white shadow-sm border border-gray-300'>
				<PostalCodeInput
					value={address?.postalCode}
					onChange={onChangePostalCodeInput}
					isLoading={isLoading}
					t={t as unknown as TranslateFn}
					error={errors.postalCode}
					touched={touched.postalCode}
					onBlur={() => onBlur('postalCode')}
				/>
				{isLoading && (
					<View>
						<Text>{t('addNewShippingAddress.loading') || 'Aguarde...'}</Text>
					</View>
				)}
				<AddressFields
					address={address}
					handleAddressChange={handleAddressChange}
					t={t as unknown as TranslateFn}
					touched={touched}
					errors={errors}
					onBlur={onBlur}
				/>
			</View>

			{addressError && (
				<View className={'p-4'}>
					<View className='bg-red-100 border border-red-400 px-4 py-3'>
						<Text className='text-red-700 font-medium'>{addressError}</Text>
					</View>
				</View>
			)}

			<FixedBottom
				className='flex flex-col align-center gap-4'
				offSetHeight={77}>
				<CustomButton
					width='100%'
					marginTop='large'
					label={
						isLoading
							? t('addNewShippingAddress.loading') || 'Aguarde...'
							: t('addNewShippingAddress.labelButton')
					}
					fontSize='medium'
					disabled={!isValidAddress || isLoading}
					onPress={() => {
						// Marca todos os campos como tocados ao tentar submeter
						setTouched({
							postalCode: true,
							street: true,
							neighborhood: true,
							city: true,
							state: true,
							receiverName: true,
							number: true
						})
						submit()
					}}
					isLoading={isLoading}
				/>
			</FixedBottom>

			<BottomInset />
		</Page>
	)
}
