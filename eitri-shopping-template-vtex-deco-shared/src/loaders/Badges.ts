import type { Color, ImageWidget } from '../types/widgets'

/**
 * Posição do badge sobre a imagem do produto no card.
 * @title Posição
 */
export type BadgePosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

/**
 * Badge de texto — usado quando não há imagem.
 * @title Badge de texto
 */
export interface TextBadge {
	/**
	 * @title Texto
	 * @description Texto exibido no badge (ex.: "NOVO", "-20%").
	 */
	text: string
	/**
	 * @title Cor de fundo
	 * @format color
	 */
	bgColor?: Color
	/**
	 * @title Cor do texto
	 * @format color
	 */
	textColor?: Color
}

/**
 * Regra que associa um badge (imagem OU texto) a um conjunto de produtos,
 * categorias ou coleções, com vigência opcional.
 * @title Regra de badge
 */
export interface BadgeRule {
	/**
	 * @title Aplicar por
	 * @description Como os IDs abaixo são interpretados: por produto (productId),
	 * por categoria (id da árvore de categoria) ou por coleção/cluster (id da coleção).
	 */
	type: 'product' | 'category' | 'collection'
	/**
	 * @title IDs
	 * @description Lista de IDs conforme o tipo escolhido (productId / categoryId / collectionId).
	 */
	values: string[]
	/**
	 * @title Imagem do badge
	 * @description Quando preenchida, o badge é exibido como imagem (tem prioridade sobre o texto).
	 * @format image-uri
	 */
	image?: ImageWidget
	/**
	 * @title Badge de texto
	 * @description Usado somente quando não há imagem.
	 */
	textBadge?: TextBadge
	/**
	 * @title Posição no card
	 * @description Canto da imagem do produto onde o badge aparece. Padrão: canto superior esquerdo.
	 */
	position?: BadgePosition
	/**
	 * @title Início da vigência
	 * @description Opcional. Antes desta data o badge não aparece. Vazio = sem início definido.
	 * @format datetime
	 */
	startDate?: string
	/**
	 * @title Fim da vigência
	 * @description Opcional. Depois desta data o badge deixa de aparecer. Vazio = sem expiração.
	 * @format datetime
	 */
	endDate?: string
}

/**
 * Badges promocionais dos cards de produto.
 * @title Badges de produto
 */
export interface Props {
	/**
	 * @title Regras de badges
	 * @description Cada regra associa um badge (imagem ou texto) a produtos, categorias
	 * ou coleções, com vigência opcional. A ordem define a prioridade de exibição.
	 */
	rules?: BadgeRule[]
}

/**
 * Loader de configuração dos badges de produto.
 *
 * Não há runtime Deco vivo executando este loader no app — o que importa é a `Props`
 * (que o admin do Deco lê para montar o formulário) e o JSON persistido em
 * `.deco/blocks/config-Badges.json`, consumido diretamente pelo `BadgesService`.
 * Esta função identidade existe apenas para conformar à convenção de loader do Deco.
 */
export default function badgesLoader(props: Props): Props {
	return props
}
