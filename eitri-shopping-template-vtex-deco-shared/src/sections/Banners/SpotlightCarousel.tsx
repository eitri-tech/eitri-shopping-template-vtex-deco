import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Image, Text, View } from 'eitri-luminus'
import { processActions } from '../../services/ResolveCmsActions'
import type { CmsAction } from '../types'
import type { Color, ImageWidget } from '../../types/widgets'

// View has no `backgroundColor` prop in its .d.ts — kept as-is (pre-existing, likely a no-op at runtime).
const ViewAny = View as unknown as (props: Record<string, unknown> & { children?: ReactNode }) => JSX.Element

export interface SpotlightCarouselImage {
	/** @title Imagem (APP) */
	imageUrl?: ImageWidget
	/** @title Texto alternativo (ALT) */
	alt?: string
	/** @title Link de destino */
	action?: CmsAction
}

export type SpotlightTextColor = 'black' | 'white'
export type SpotlightTextAlign = 'left' | 'center'

export interface Props {
	/**
	 * @title Título.
	 * @description Fonte e espaçamentos seguem o padrão do app (não configuráveis).
	 */
	title?: string
	/**
	 * @title Cor do título.
	 */
	titleColor?: SpotlightTextColor
	/**
	 * @title Alinhamento do título.
	 */
	titleAlign?: SpotlightTextAlign

	/**
	 * @title Subtítulo.
	 */
	subtitle?: string
	/**
	 * @title Cor do subtítulo.
	 */
	subtitleColor?: SpotlightTextColor
	/**
	 * @title Alinhamento do subtítulo.
	 */
	subtitleAlign?: SpotlightTextAlign

	/**
	 * @title Cor de fundo do retângulo.
	 */
	backgroundColor?: Color
	/**
	 * @title Imagem de fundo (opcional).
	 * @description Se preenchida, sobrepõe a cor de fundo.
	 */
	backgroundImage?: ImageWidget
	/**
	 * @title Altura do retângulo de fundo (px).
	 */
	backgroundHeight?: number

	/**
	 * @title Espaçamento superior do título (px).
	 */
	paddingTop?: number
	/**
	 * @title Espaçamento inferior da seção (px).
	 */
	paddingBottom?: number

	/**
	 * @title Imagens do carrossel.
	 */
	images?: SpotlightCarouselImage[]
	/**
	 * @title Proporção da imagem (ex.: 3/4, 4/5, 1/1).
	 * @description Formato largura/altura. As imagens verticais mantêm o enquadramento (recorte, sem distorção).
	 */
	aspectRatio?: string
	/**
	 * @title Loop infinito.
	 * @description Quando ativo, o carrossel não termina — volta ao início ao chegar na última imagem.
	 */
	loop?: boolean
}

// Padrão de tipografia/espaçamento do app (BannerTrio + SectionTitle):
// título 24px semibold, subtítulo 14px normal, gap título→subtítulo 4px,
// gap subtítulo→carrossel 16px, gap entre imagens 12px. Não configurável —
// mantém consistência visual com as demais seções de banner.
const TITLE_CLASS = 'font-semibold text-2xl'
const SUBTITLE_CLASS = 'font-normal text-sm'
const TITLE_SUBTITLE_GAP = 4
const SUBTITLE_CAROUSEL_GAP = 16

const TEXT_COLOR_CLASS: Record<SpotlightTextColor, string> = {
	black: 'text-black',
	white: 'text-white'
}

const TEXT_ALIGN_CLASS: Record<SpotlightTextAlign, string> = {
	left: 'text-left',
	center: 'text-center'
}

export default function SpotlightCarousel({
	title,
	titleColor = 'white',
	titleAlign = 'left',
	subtitle,
	subtitleColor = 'white',
	subtitleAlign = 'left',
	backgroundColor = '#161616',
	backgroundImage,
	backgroundHeight = 180,
	paddingTop = 20,
	paddingBottom = 20,
	images = [],
	aspectRatio = '4/5',
	loop = false
}: Props) {
	const scrollRef = useRef<any>(null)
	const [showIndicator, setShowIndicator] = useState(false)
	const [thumb, setThumb] = useState({ ratio: 1, offset: 0 })

	const itemsCount = images.length
	const loopEnabled = loop && itemsCount > 1
	// Com loop, a lista é triplicada (esquerda/meio/direita). O scroll começa
	// no conjunto do meio e, ao cruzar seus limites, é reposicionado de forma
	// instantânea para o mesmo ponto visual no conjunto vizinho — como as
	// imagens se repetem, o "salto" é imperceptível para o usuário.
	const renderedImages = loopEnabled ? [...images, ...images, ...images] : images

	// O `ref` num <View> (class component do luminus) aponta para a instância,
	// não para o <div>. Use getViewElement() para obter o elemento DOM real.
	const getScrollEl = () => {
		const view: any = scrollRef.current
		if (!view) return null
		return typeof view.getViewElement === 'function' ? view.getViewElement() : view
	}

	const measure = useCallback(() => {
		const el = getScrollEl()
		if (!el || !itemsCount) return

		if (loopEnabled) {
			const setWidth = el.scrollWidth / 3
			el.scrollLeft = setWidth
			return
		}

		const overflow = el.scrollWidth > el.clientWidth + 1
		setShowIndicator(overflow)
		if (overflow) {
			setThumb({ ratio: el.clientWidth / el.scrollWidth, offset: 0 })
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loopEnabled, itemsCount])

	useEffect(() => {
		measure()
		const raf = requestAnimationFrame(measure)
		window.addEventListener('resize', measure)
		return () => {
			cancelAnimationFrame(raf)
			window.removeEventListener('resize', measure)
		}
	}, [images, measure])

	const handleScroll = useCallback(
		(event: any) => {
			const el = event.currentTarget

			if (loopEnabled) {
				const setWidth = el.scrollWidth / 3
				if (el.scrollLeft < setWidth * 0.5) {
					el.scrollLeft += setWidth
				} else if (el.scrollLeft >= setWidth * 1.5) {
					el.scrollLeft -= setWidth
				}
				return
			}

			const maxScroll = el.scrollWidth - el.clientWidth
			if (maxScroll <= 0) return

			const ratioPct = thumb.ratio * 100
			const offset = (el.scrollLeft / maxScroll) * (100 - ratioPct)
			setThumb(prev => ({ ...prev, offset }))
		},
		[loopEnabled, thumb.ratio]
	)

	const handleImageClick = (item: SpotlightCarouselImage) => {
		if (item?.action?.value) processActions(item)
	}

	if (!itemsCount && !title && !subtitle) return null

	return (
		<View className='relative'>
			<View className='absolute top-0 left-0 right-0 overflow-hidden' height={backgroundHeight}>
				{backgroundImage ? (
					<Image src={backgroundImage} alt='' className='w-full h-full object-cover' />
				) : (
					<ViewAny className='w-full h-full' backgroundColor={backgroundColor} />
				)}
			</View>

			<View className='relative flex flex-col'>
				<View height={paddingTop} />

				{title ? (
					<View className='px-4'>
						<Text
							className={`${TITLE_CLASS} ${TEXT_COLOR_CLASS[titleColor]} ${TEXT_ALIGN_CLASS[titleAlign]} block`}>
							{title}
						</Text>
					</View>
				) : null}

				{title && subtitle ? <View height={TITLE_SUBTITLE_GAP} /> : null}

				{subtitle ? (
					<View className='px-4'>
						<Text
							className={`${SUBTITLE_CLASS} ${TEXT_COLOR_CLASS[subtitleColor]} ${TEXT_ALIGN_CLASS[subtitleAlign]} block`}>
							{subtitle}
						</Text>
					</View>
				) : null}

				{(title || subtitle) && itemsCount ? <View height={SUBTITLE_CAROUSEL_GAP} /> : null}

				{itemsCount ? (
					<View className='flex flex-col'>
						<View
							ref={scrollRef}
							onScroll={handleScroll}
							className='flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
							<View className='flex gap-3 px-4'>
								{renderedImages.map((item, index) => (
									<View key={index} className='w-[70vw] min-w-[70vw] shrink-0'>
										{item.imageUrl ? (
											<Image
												src={item.imageUrl}
												alt={item.alt || title || ''}
												onClick={() => handleImageClick(item)}
												className='w-full object-cover'
												style={{ aspectRatio }}
											/>
										) : null}
									</View>
								))}
							</View>
						</View>

						{showIndicator ? (
							<>
								<View height={12} />
								<View className='flex justify-center'>
									<View className='flex w-2/5 h-[3px] rounded-full bg-[#D9D5C9] overflow-hidden'>
										<View width={`${thumb.offset}%`} />
										<View width={`${thumb.ratio * 100}%`} className='h-full rounded-full bg-black' />
									</View>
								</View>
							</>
						) : null}
					</View>
				) : null}

				<View height={paddingBottom} />
			</View>
		</View>
	)
}
