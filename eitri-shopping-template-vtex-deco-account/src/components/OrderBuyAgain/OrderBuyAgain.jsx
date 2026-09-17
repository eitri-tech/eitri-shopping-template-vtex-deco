import { useState } from 'react'
import Eitri from 'eitri-bifrost'
import { CustomButton } from 'eitri-shopping-template-vtex-deco-shared'
import { useLocalShoppingCart } from '../../providers/LocalCart'
import { useTranslation } from 'eitri-i18n'

export default function OrderBuyAgain({ order }) {
	const { addItem } = useLocalShoppingCart()
	const { t } = useTranslation()
	const [isLoading, setIsLoading] = useState(false)

	if (!order) return null

	const addToCart = async () => {
		setIsLoading(true)
		try {
			for (const item of order.items) {
				await addItem({ id: item.id, quantity: item.quantity, seller: item.seller })
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
