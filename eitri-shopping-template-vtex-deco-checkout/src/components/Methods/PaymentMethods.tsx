import { useMemo } from 'react'
import { View } from 'eitri-luminus'
import ImplementationInterface from '../PaymentsGroups/ImplementationInterface'
import { useLocalShoppingCart } from '../../providers/LocalCart'
import { getPaymentSystem } from '../../utils/getPaymentSystem'
import type { PaymentSystemGroup } from '../../utils/getPaymentSystem'
import { App } from 'eitri-shopping-vtex-shared'
import type { OnSelectPaymentMethod } from '../../types/vtex'

interface PaymentMethodsProps {
	onSelectPaymentMethod?: OnSelectPaymentMethod
}

export default function PaymentMethods(props: PaymentMethodsProps) {
	const { cart } = useLocalShoppingCart()

	const { onSelectPaymentMethod } = props

	const filterGiftPaymentOnGiftCard = (group: PaymentSystemGroup): boolean => {
		return (
			group.groupName === 'giftCardPaymentGroup' &&
			(cart?.items ?? []).some(item => String(item?.productCategoryIds ?? '').includes('/4440/'))
		)
	}

	const paymentSystemGroups = useMemo<PaymentSystemGroup[]>(() => {
		const groups = cart ? getPaymentSystem(cart) : undefined
		return (groups ?? []).filter(group => !filterGiftPaymentOnGiftCard(group))
	}, [cart])

	const executeSort = (groups: PaymentSystemGroup[]): PaymentSystemGroup[] => {
		// eitri-shopping-vtex-shared's own .d.ts only declares { verbose, gaVerbose } for App.configs,
		// tighter than its real runtime shape (which carries the merged appConfigs too).
		const configs = App?.configs as
			| { appConfigs?: { checkout?: { paymentSystemDisplayOrder?: string[] } } }
			| undefined
		const displayOrder = configs?.appConfigs?.checkout?.paymentSystemDisplayOrder
		if (!Array.isArray(displayOrder)) return groups
		return [...groups].sort((a, b) => {
			const ai = displayOrder.indexOf(a.groupName ?? '')
			const bi = displayOrder.indexOf(b.groupName ?? '')
			return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi)
		})
	}

	return (
		<View className='w-full gap-4 flex flex-col'>
			{executeSort(paymentSystemGroups).map(system => (
				<ImplementationInterface
					key={system.groupName}
					groupName={system.groupName}
					systemGroup={system}
					onSelectPaymentMethod={onSelectPaymentMethod}
				/>
			))}
		</View>
	)
}
