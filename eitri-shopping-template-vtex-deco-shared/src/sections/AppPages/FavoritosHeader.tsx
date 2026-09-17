export interface Props {
	/**
	 * @title Título "Meus favoritos"
	 */
	title?: string
	/**
	 * @title Contador de produtos (use {{count}})
	 */
	productsCount?: string
}

// ponytail: seção somente de textos — consumida pela view nativa (Wishlist) via
// `useAppPageTexts`. Existe para o Deco montar o formulário de edição no painel.
export default function FavoritosHeader(_: Props) {
	return null
}
