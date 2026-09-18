import { View, Text, Image } from 'eitri-luminus'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { processActions } from '../services/ResolveCmsActions'
import type { CmsAction } from './types'
import type { ImageWidget, Color } from '../types/widgets'

export interface BrandItem {
	/**
	 * @title Imagem.
	 */
	imageUrl?: ImageWidget
	/**
	 * @title Ação de destino.
	 * @description Produto, categoria, coleção, marca, página ou link — mesmo padrão usado nas outras seções.
	 */
	action?: CmsAction
}

export type BrandCarouselAlign = 'left' | 'center' | 'right'

export interface Props {
	/**
	 * @title Exibir título.
	 */
	showTitle?: boolean
	/**
	 * @title Título da seção.
	 */
	title?: string
	/**
	 * @title Cor do título.
	 */
	titleColor?: Color
	/**
	 * @title Alinhamento do título.
	 */
	titleAlign?: BrandCarouselAlign
	/**
	 * @title Carrossel infinito.
	 * @description Ao chegar no final, volta para o início continuamente. Se desativado, o carrossel termina no último conteúdo.
	 */
	infinite?: boolean
	/**
	 * @title Aspect Ratio dos cards (ex.: 3:2).
	 * @description Formato largura:altura de cada card de imagem. Se vazio, usa 3:2.
	 */
	aspectRatio?: string
	/**
	 * @title Marcas.
	 * @description Cada item é uma imagem clicável. A cada 2 itens forma-se uma coluna (imagem em cima, imagem embaixo).
	 */
	items?: BrandItem[]
}

const ALIGN_CLASS: Record<BrandCarouselAlign, string> = {
	left: 'text-left',
	center: 'text-center',
	right: 'text-right'
}

type Column = [BrandItem, BrandItem | null]

// A cada 2 itens forma-se uma coluna [topo, baixo]. Quantidade ímpar: última
// coluna fica só com o item de cima, o de baixo vira um espaço vazio (não quebra o layout).
function buildColumns(items: BrandItem[]): Column[] {
	const columns: Column[] = []
	for (let i = 0; i < items.length; i += 2) {
		columns.push([items[i], items[i + 1] ?? null])
	}
	return columns
}

interface CardProps {
	item: BrandItem | null
	aspectRatio?: string
}

function BrandCard({ item, aspectRatio }: CardProps) {
	const style = aspectRatio ? { aspectRatio: aspectRatio.replace(':', '/') } : undefined
	const sizingClassName = `w-full ${aspectRatio ? '' : 'aspect-[3/2]'}`

	// Coluna ímpar: mantém o espaço reservado (mesma altura) sem renderizar nada visível,
	// para não quebrar o alinhamento das colunas vizinhas.
	if (!item || !item.imageUrl) {
		return <View className={`${sizingClassName} opacity-0`} style={style} />
	}

	return (
		<View
			className={`${sizingClassName} bg-gray-100 overflow-hidden`}
			style={style}
			onClick={() => processActions(item)}>
			<Image src={item.imageUrl} className='w-full h-full object-cover' />
		</View>
	)
}

// Múltiplo de conjuntos renderizados quando `infinite` está ativo: um conjunto
// "anterior" e um "seguinte" ao redor do conjunto principal, para permitir
// arrastar em ambas as direções sem nunca esbarrar numa borda visível.
const INFINITE_REPEAT = 3

export default function BrandCarousel({
	showTitle = true,
	title,
	titleColor,
	titleAlign = 'left',
	infinite = false,
	aspectRatio,
	items = []
}: Props) {
	const columns = useMemo(() => buildColumns(items.filter(item => !!item?.imageUrl)), [items])
	const hasContent = columns.length > 0
	const canLoop = infinite && columns.length > 1

	const renderColumns = useMemo(() => {
		if (!canLoop) return columns
		const repeated: Column[] = []
		for (let i = 0; i < INFINITE_REPEAT; i++) repeated.push(...columns)
		return repeated
	}, [canLoop, columns])

	const scrollRef = useRef<any>(null)
	const [showIndicator, setShowIndicator] = useState(false)
	const [thumb, setThumb] = useState({ ratio: 1, offset: 0 })
	const mainWidthRef = useRef(0)
	const didInitRef = useRef(false)

	// O `ref` num <View> (class component do luminus) aponta para a instância,
	// não para o <div>. Use getViewElement() para obter o elemento DOM real.
	const getScrollEl = () => {
		const view: any = scrollRef.current
		if (!view) return null
		return typeof view.getViewElement === 'function' ? view.getViewElement() : view
	}

	const measure = useCallback(() => {
		const el = getScrollEl()
		if (!el || !hasContent) return

		if (canLoop) {
			const total = el.scrollWidth
			const main = total / INFINITE_REPEAT
			mainWidthRef.current = main
			const overflow = main > el.clientWidth + 1
			setShowIndicator(overflow)
			if (overflow) {
				setThumb(prev => ({ ...prev, ratio: el.clientWidth / main }))
			}
			if (!didInitRef.current && main > 0) {
				el.scrollLeft = main
				didInitRef.current = true
			}
			return
		}

		const overflow = el.scrollWidth > el.clientWidth + 1
		setShowIndicator(overflow)
		if (overflow) {
			setThumb({ ratio: el.clientWidth / el.scrollWidth, offset: 0 })
		}
	}, [canLoop, hasContent])

	useEffect(() => {
		didInitRef.current = false
		const el = getScrollEl()
		if (el && !canLoop) el.scrollLeft = 0
		measure()
		// re-mede após o layout/imagens assentarem
		const raf = requestAnimationFrame(measure)
		window.addEventListener('resize', measure)
		return () => {
			cancelAnimationFrame(raf)
			window.removeEventListener('resize', measure)
		}
	}, [columns, canLoop, measure])

	const handleScroll = useCallback(
		(event: any) => {
			const el = event.currentTarget

			if (canLoop) {
				const main = mainWidthRef.current
				if (!main) return

				// Perto de uma borda do conjunto triplicado: salta (sem animação) para
				// a posição equivalente no conjunto vizinho, criando o efeito infinito.
				const edgeGuard = Math.max(main * 0.05, 20)
				if (el.scrollLeft <= edgeGuard) {
					el.scrollLeft += main
				} else if (el.scrollLeft >= main * 2 - edgeGuard) {
					el.scrollLeft -= main
				}

				const clientWidth = el.clientWidth
				const maxScroll = main - clientWidth
				if (maxScroll <= 0) return

				let logical = el.scrollLeft - main
				logical = ((logical % main) + main) % main
				const ratioPct = thumb.ratio * 100
				const offset = Math.min(Math.max((logical / maxScroll) * (100 - ratioPct), 0), 100 - ratioPct)
				setThumb(prev => ({ ...prev, offset }))
				return
			}

			const maxScroll = el.scrollWidth - el.clientWidth
			if (maxScroll <= 0) return
			const ratioPct = thumb.ratio * 100
			const offset = (el.scrollLeft / maxScroll) * (100 - ratioPct)
			setThumb(prev => ({ ...prev, offset }))
		},
		[canLoop, thumb.ratio]
	)

	if (!hasContent) return null

	return (
		<View className='flex flex-col gap-3 px-4 pt-2'>
			{showTitle && title ? (
				<Text
					className={`text-xl font-bold text-gray-900 ${ALIGN_CLASS[titleAlign] || ALIGN_CLASS.left}`}
					style={titleColor ? { color: titleColor } : undefined}>
					{title}
				</Text>
			) : null}

			<View className='flex flex-col -mx-4'>
				<View
					ref={scrollRef}
					onScroll={handleScroll}
					className='flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
					<View className='flex gap-2 px-4'>
						{renderColumns.map((column, index) => (
							<View key={index} className='w-[36vw] min-w-[36vw] flex flex-col gap-2'>
								<BrandCard item={column[0]} aspectRatio={aspectRatio} />
								<BrandCard item={column[1]} aspectRatio={aspectRatio} />
							</View>
						))}
					</View>
				</View>

				{showIndicator && (
					<View className='flex justify-center mt-3'>
						<View className='flex w-2/5 h-[3px] rounded-full bg-[#D9D5C9] overflow-hidden'>
							<View width={`${thumb.offset}%`} />
							<View width={`${thumb.ratio * 100}%`} className='h-full rounded-full bg-black' />
						</View>
					</View>
				)}
			</View>
		</View>
	)
}
