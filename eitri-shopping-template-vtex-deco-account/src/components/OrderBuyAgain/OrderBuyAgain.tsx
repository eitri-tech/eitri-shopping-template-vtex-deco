import { useState } from 'react'
import Eitri from 'eitri-bifrost'
import { CustomButton } from 'eitri-shopping-template-vtex-deco-shared'
import { useLocalShoppingCart } from '../../providers/LocalCart'
import { useTranslation } from 'eitri-i18n'
import type { VtexOrder } from '../../types/vtex'

interface OrderBuyAgainProps {
	order?: VtexOrder
}

export default function OrderBuyAgain({ order }: OrderBuyAgainProps) {
	const { addItem } = useLocalShoppingCart()
	const { t } = useTranslation()
	const [isLoading, setIsLoading] = useState(false)

	if (!order) return null

	const addToCart = async () => {
		setIsLoading(true)
		try {
			for (const item of order.items ?? []) {
				// CartAddItemInput also declares `item`/`salesChannel` as required — this call
				// never provided them (pre-existing). Cast rather than guess at the right values.
				await addItem({ id: item.id, quantity: item.quantity, seller: item.seller } as any)
			}
			Eitri.nativeNavigation.open({ slug: 'cart' })
		} catch (e) {
			console.error('Erro ao adicionar itens ao carrinho', e)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<CustomButton
			outlined
			width='100%'
			label={isLoading ? t('orderBuyAgain.loading') : t('orderBuyAgain.buyAgain')}
			disabled={isLoading}
			onPress={addToCart}
		/>
	)
}
