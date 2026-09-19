import { useEffect } from 'react'
import { Page } from 'eitri-luminus'
import { useLocalShoppingCart } from '../providers/LocalCart'
import { navigate, openCart } from '../services/navigationService'
import { shippingResolver } from 'eitri-shopping-template-vtex-deco-shared'

// Page's real .d.ts declares `children` as required, tighter than this bare loading-transition
// screen (it never renders anything — it just decides where to navigate next).
const PageAny = Page as unknown as (props: Record<string, unknown>) => JSX.Element

export default function FreightResolver() {
	const { cart } = useLocalShoppingCart()

	useEffect(() => {
		const currentCart = cart
		if (!currentCart?.shippingData?.address) {
			navigate('AddressForm', {}, true)
			return
		}

		const address = currentCart.shippingData.address
		if (address.addressType === 'residential' && !address.number) {
			navigate('AddressForm', { addressId: address.addressId ?? '' }, true)
			return
		}

		const shipping = shippingResolver(currentCart)

		if (!shipping || (shipping.options?.length ?? 0) === 0) {
			openCart()
			return
		}

		if (shipping.options.some(opt => !opt.fulfillsAllItems)) {
			navigate('MultipleFreightSelector', {}, true)
			return
		}

		navigate('ShippingMethod', {}, true)
	}, [cart])

	return <PageAny />
}
