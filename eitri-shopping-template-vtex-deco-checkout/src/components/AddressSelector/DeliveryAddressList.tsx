import { View } from 'eitri-luminus'
import AddressCard from './AddressCard'
import type { VtexAddress } from '../../types/vtex'

interface DeliveryAddressListProps {
	addresses?: VtexAddress[]
	selectedAddress?: VtexAddress | null
	onAddressSelect?: (address: VtexAddress) => void
}

export default function DeliveryAddressList(props: DeliveryAddressListProps) {
	const { addresses, selectedAddress, onAddressSelect } = props
	const list = Array.isArray(addresses) ? addresses : []

	return (
		<View className='flex flex-col gap-3'>
			{list.map((address, index) => (
				<View key={address?.addressId ?? index}>
					<AddressCard
						address={address}
						isSelected={!!selectedAddress?.addressId && selectedAddress.addressId === address?.addressId}
						onClick={() => {
							if (typeof onAddressSelect === 'function') onAddressSelect(address)
						}}
					/>
				</View>
			))}
		</View>
	)
}
