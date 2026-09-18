import { View, Text } from 'eitri-luminus'
import { useTranslation } from 'eitri-i18n'
import ProductCard from '../components/ProductCard/ProductCard'
import CustomButton from '../components/CustomButton/CustomButton'
import WishlistIcon from '../components/WishlistIcon/WishlistIcon'
import useWishlistItems from '../hooks/useWishlistItems'
import { openCategories } from '../services/NavigationService'

// Classes literais (não interpoladas) pra o Tailwind conseguir escanear e gerar o utilitário.
const COLUMN_CLASSES: Record<number, string> = {
	1: 'grid-cols-1',
	2: 'grid-cols-2',
	3: 'grid-cols-3',
	4: 'grid-cols-4'
}

export interface Props {
	/**
	 * @title Colunas da grade.
	 */
	columns?: number
	/**
	 * @title Título do estado vazio
	 */
	emptyTitle?: string
	/**
	 * @title Subtítulo do estado vazio
	 */
	emptySubtitle?: string
	/**
	 * @title Botão "Conferir as novidades"
	 */
	discoverButton?: string
}

/**
 * Grid dos produtos favoritados pelo usuário logado. Conteúdo é sempre "a
 * wishlist do usuário atual" — não há prop de quais produtos exibir. Decide
 * vazio a partir dos mesmos dados que renderiza (sem segunda fonte pra divergir).
 */
export default function WishlistGrid({ columns = 2, emptyTitle, emptySubtitle, discoverButton }: Props) {
	const { t } = useTranslation()
	const { items, isLoading } = useWishlistItems()

	if (items.length === 0) {
		// ponytail: sem spinner próprio — o `Loading fullScreen` da view nativa
		// (que dispara junto, mesmo hook/mesmos eventos) já cobre esse estado.
		if (isLoading) return null

		return (
			<View className='min-h-[60vh] flex flex-col justify-center items-center px-8 gap-4'>
				<WishlistIcon
					filled
					size={60}
					className='text-black'
				/>
				<Text className='font-bold text-xl text-center'>{emptyTitle ?? t('wishlist.emptyTitle')}</Text>
				<Text className='text-center text-gray-600 text-sm'>{emptySubtitle ?? t('wishlist.emptySubtitle')}</Text>
				<CustomButton
					label={discoverButton ?? t('wishlist.discoverButton')}
					onClick={openCategories}
				/>
			</View>
		)
	}

	return (
		<View className={`grid ${COLUMN_CLASSES[columns] ?? COLUMN_CLASSES[2]} gap-4 px-4`}>
			{items.map(product => (
				<ProductCard
					key={product.productId}
					product={product}
				/>
			))}
		</View>
	)
}
