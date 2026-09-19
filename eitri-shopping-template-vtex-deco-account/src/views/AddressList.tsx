import { useState, useEffect, useRef } from 'react'
import { View, Text } from 'eitri-luminus'
import ProtectedView from '../components/ProtectedView/ProtectedView'
import { HeaderContentWrapper, HeaderReturn, HeaderText, Loading, BottomInset, GenericBox, CustomButton } from 'eitri-shopping-template-vtex-deco-shared'
import { sendScreenView } from '../services/TrackingService'
import { addonUserTappedActiveTabListener } from '../utils/backToTopListener'
import { deleteAddress, getAddresses } from '../services/AddressService'
import { navigate, PAGES } from '../services/NavigationService'
import ModalConfirm from '../components/ModalConfirm/ModalConfirm'
import { useTranslation } from 'eitri-i18n'
import type { VtexAddress } from '../types/vtex'

interface AddressCardProps {
	address: VtexAddress
	onEdit: (address: VtexAddress) => void
	onDelete: (address: VtexAddress) => void
}

const AddressCard = (props: AddressCardProps) => {
	const { address, onEdit, onDelete } = props
	const { t } = useTranslation()
	return (
		<GenericBox className='p-4 mb-4'>
			<View className='space-y-2'>
				<View>
					<Text className='text-gray-700 block'>
						{address.street}, {address.number}
						{address.complement && ` - ${address.complement}`}
					</Text>
				</View>

				<View>
					<Text className='text-gray-700 block'>
						{address.neighborhood} - {address.city}/{address.state}
					</Text>
				</View>

				<View>
					<Text className='text-gray-600 block'>
						{t('addressList.postalCode')}
						{address.postalCode}
					</Text>
				</View>

				{address.receiverName && (
					<View>
						<Text className='text-gray-600 block'>
							{t('addressList.recipient')}
							{address.receiverName}
						</Text>
					</View>
				)}

				<View className='flex gap-2 w-full justify-end mt-3 pt-3 border-t border-gray-200'>
					<CustomButton
						className={'!w-fit !px-3 !py-1 !h-auto'}
						label={t('addressList.edit')}
						onClick={() => onEdit(address)}
					/>
					<CustomButton
						outlined
						className={'!w-fit !px-3 !py-1 !h-auto'}
						label={t('addressList.delete')}
						onClick={() => onDelete(address)}
					/>
				</View>
			</View>
		</GenericBox>
	)
}

export default function AddressList() {
	const { t } = useTranslation()
	const [addresses, setAddresses] = useState<VtexAddress[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const [showModalDelete, setShowModalDelete] = useState(false)

	const removingItem = useRef<VtexAddress | null>(null)

	useEffect(() => {
		addonUserTappedActiveTabListener()
		sendScreenView('Meus Endereços', 'AddressList')
		loadAddresses()
	}, [])

	const loadAddresses = async () => {
		setIsLoading(true)

		try {
			const addresses = await getAddresses()
			setAddresses(addresses)
		} catch (e) {
			console.error('Erro ao carregar endereços:', e)
		}
		setIsLoading(false)
	}

	const handleEdit = (address: VtexAddress) => {
		navigate(PAGES.ADDRESS_FORM, { address })
	}

	const handleDelete = (address: VtexAddress) => {
		setShowModalDelete(true)
		removingItem.current = address
	}

	const confirmDelete = () => {
		if (removingItem.current) {
			setShowModalDelete(false)
			const newAddresses = addresses.filter(address => address.addressId !== removingItem.current?.addressId)
			const addressId = removingItem.current.addressId
			if (addressId) {
				deleteAddress(addressId).then(() => {
					removingItem.current = null
				})
			}
			setAddresses(newAddresses)
		}
	}

	const handleNewAddress = () => {
		navigate(PAGES.ADDRESS_FORM)
	}

	return (
		<ProtectedView afterLoginRedirectTo={'AddressList'}>
			<View>
				<HeaderContentWrapper>
					<HeaderReturn />
					<HeaderText text={t('addressList.title')} />
				</HeaderContentWrapper>

				<Loading
					isLoading={isLoading}
					fullScreen
				/>

				{!isLoading && (
					<View className='p-4'>
						{addresses.length === 0 ? (
							<View className='text-center py-12'>
								<Text className='text-gray-500 text-lg block'>{t('addressList.empty')}</Text>
							</View>
						) : (
							addresses.map(address => (
								<AddressCard
									key={address.addressId}
									address={address}
									onEdit={handleEdit}
									onDelete={handleDelete}
								/>
							))
						)}

						<CustomButton
							onClick={handleNewAddress}
							label={t('addressList.add')}
						/>
					</View>
				)}

				<BottomInset />

				<ModalConfirm
					showModal={showModalDelete}
					removeItem={confirmDelete}
					closeModal={() => setShowModalDelete(false)}
				/>
			</View>
		</ProtectedView>
	)
}
