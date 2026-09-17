import ImplementationInterface from '../PaymentsGroups/ImplementationInterface'
import { useLocalShoppingCart } from '../../providers/LocalCart'
import { getPaymentSystem } from '../../utils/getPaymentSystem'
import { App } from 'eitri-shopping-vtex-shared'

export default function PaymentMethods(props) {
	const { cart } = useLocalShoppingCart()

	const { onSelectPaymentMethod } = props

	const filterGiftPaymentOnGiftCard = group => {
		return (
			group.groupName === 'giftCardPaymentGroup' &&
			cart?.items?.some(item => item.productCategoryIds.includes('/4440/'))
		)
	}

	const paymentSystemGroups = useMemo(() => {
		const paymentSystemGroups = getPaymentSystem(cart)

		return paymentSystemGroups?.filter(group => {
			if (filterGiftPaymentOnGiftCard(group)) return false
			return true
		})
	}, [cart])

	const executeSort = paymentSystemGroups => {
		const displayOrder = App?.configs?.appConfigs?.checkout?.paymentSystemDisplayOrder
		if (displayOrder) {
			return paymentSystemGroups.sort((a, b) => {
				const ai = displayOrder.indexOf(a.groupName)
				const bi = displayOrder.indexOf(b.groupName)
				return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi)
			})
		} else {
			return paymentSystemGroups
		}
	}

	return (
		<View className='w-full gap-4 flex flex-col'>
			{executeSort(paymentSystemGroups)?.map(system => {
				return (
					<ImplementationInterface
						key={system.groupName}
						groupName={system.groupName}
						systemGroup={system}
						onSelectPaymentMethod={onSelectPaymentMethod}
					/>
				)
			})}
		</View>
	)
}
