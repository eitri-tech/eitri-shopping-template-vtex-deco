import { useLocalShoppingCart } from '../providers/LocalCart'
import { navigate, openCart } from '../services/navigationService'
import { shippingResolver } from 'eitri-shopping-template-vtex-deco-shared'

export default function FreightResolver(props) {
	const { cart } = useLocalShoppingCart()

	useEffect(() => {
		if (!cart?.shippingData?.address) {
			navigate('AddressForm', {}, true)
		} else {
			if (cart?.shippingData?.address?.addressType === 'residential' && !cart?.shippingData?.address?.number) {
				navigate('AddressForm', { addressId: cart?.shippingData?.address?.addressId }, true)
				return
			}

			const shipping = shippingResolver(cart)

			if (!shipping || shipping?.options?.length === 0) {
				openCart()
				return
			}

			if (shipping?.options?.some(opt => !opt.fulfillsAllItems)) {
				navigate('MultipleFreightSelector', {}, true)
				return
			}

			navigate('ShippingMethod', {}, true)
		}
	}, [cart])

	return <Page></Page>
}
