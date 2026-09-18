import { useEffect, useState } from 'react'
import { Text, View } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import ShoppingBagIcon from '../ShoppingBagIcon/ShoppingBagIcon'
import type { VtexCart } from '../../types/vtex'

interface HeaderCartProps {
	quantityOfItems?: number
	onClick?: () => void
	cart?: VtexCart
}

export default function HeaderCart(props: HeaderCartProps) {
	const { quantityOfItems, onClick, cart } = props

	const [_quantityOfItems, setQuantityOfItems] = useState(quantityOfItems ?? 0)

	useEffect(() => {
		if (cart) {
			// cart.items is expected but not guaranteed by every caller — without the fallback
			// this throws and the cart badge disappears from the header entirely.
			const itemsQuantity = (cart.items ?? []).reduce((acc, item) => acc + (item.quantity ?? 0), 0)
			setQuantityOfItems(itemsQuantity)
		}
	}, [cart])

	const handlePress = () => {
		if (onClick) {
			onClick()
			return
		} else {
			Eitri.nativeNavigation.open({
				slug: 'cart'
			})
		}
	}

	return (
		<View
			className={`relative mr-[5px] w-[25px] h-[25px] flex items-center text-header-content`}
			onClick={handlePress}>
			<View>
				<ShoppingBagIcon size={24} />
			</View>

			{_quantityOfItems > 0 && (
				<View
					className={`absolute top-[-11px] right-[-10px] flex rounded-full w-[18px] h-[18px] justify-center items-center bg-warning`}>
					<Text className='text-[12px] font-bold text-warning-content'>{_quantityOfItems}</Text>
				</View>
			)}
		</View>
	)
}
