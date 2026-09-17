import { Text, View } from 'eitri-luminus'
import { useTranslation } from 'eitri-i18n'
import { navigate } from '../../services/navigationService'

export default function AddressCard({ address, isSelected = false, onClick, showBusinessHours = false, title = null }) {
	const isPickupPoint = address?.friendlyName

	const { t } = useTranslation()

	const formatBusinessHours = businessHours => {
		if (!businessHours || businessHours.length === 0) return ''

		const today = new Date().getDay()

		const todayHours = businessHours.find(h => h.DayOfWeek === today)
		if (todayHours) {
			return `Hoje: ${todayHours?.OpeningTime?.slice(0, 5)} - ${todayHours.ClosingTime.slice(0, 5)}`
		}

		return 'Horário disponível'
	}

	const editAddress = () => {
		navigate('AddressForm', { addressId: address.addressId })
	}

	return (
		<View
			className={`bg-white rounded shadow-sm border border-gray-300 p-4 w-full flex flex-col ${
				isSelected ? 'border-2 border-primary' : 'border-neutral-300 hover:border-primary/30 bg-base-100'
			}`}
			onClick={onClick}>
			<View className='flex flex-row justify-between items-start'>
				<View className='flex flex-col gap-1 flex-1'>
					{title && <Text className='text-sm font-medium text-primary mb-2'>{title}</Text>}

					<Text className='font-semibold text-base-content text-base mb-1'>
						{isPickupPoint ? address.friendlyName : address.street}
					</Text>

					<Text className='text-sm text-base-content/70 mb-1'>
						{isPickupPoint
							? `${address.address.street}, ${address.address.number}`
							: `${address.street} • ${address.number}`}
					</Text>

					<Text className='text-sm text-base-content/70 mb-1'>
						{isPickupPoint
							? `${address.address.neighborhood} • ${address.address.city}`
							: `${address.neighborhood} • ${address.city} • ${address.state}`}
					</Text>

					<Text className='text-xs text-base-content/50 mb-2'>
						{isPickupPoint ? address.address.postalCode : address.postalCode}
					</Text>

					{showBusinessHours && address.businessHours && (
						<Text className='text-xs text-primary font-medium'>
							{formatBusinessHours(address.businessHours)}
						</Text>
					)}

					<View
						onClick={editAddress}
						className='mt-2'>
						<Text className='uppercase text-xs text-primary-700'>{t('addressSelector.edit')}</Text>
					</View>
				</View>

				{isSelected && (
					<View className='flex items-center justify-center w-6 h-6 bg-primary rounded-full ml-3'>
						<svg
							width='12'
							height='12'
							viewBox='0 0 16 16'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'>
							<path
								d='M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z'
								fill='white'
							/>
						</svg>
					</View>
				)}
			</View>
		</View>
	)
}
