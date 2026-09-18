import { useEffect, useRef, useState } from 'react'
import { Image, Text, View } from 'eitri-luminus'
import { processActions } from '../../services/ResolveCmsActions'
import SectionTitle from '../../components/SectionTitle/SectionTitle'
import ChevronRightIcon from '../../components/ChevronRightIcon/ChevronRightIcon'
import type { CmsAction } from '../types'
import type { ImageWidget } from '../../types/widgets'

export interface BannerDuoItem {
	/** @title URL da imagem */
	imageUrl?: ImageWidget
	/** @title URL externa da imagem (alternativa) */
	externalImageUrl?: string
	/** @title Texto alternativo da imagem (alt) */
	alt?: string
	/** @title Destino do link do banner */
	action?: CmsAction
	/** @title Título (exibido abaixo do banner) */
	bannerTitle?: string
	/** @title Texto (exibido abaixo do título) */
	bannerText?: string
}

export interface Props {
	/** @title Título */
	title?: string
	/**
	 * @title Exibir "ver todos"
	 * @description Mostra o link "ver todos" no cabeçalho da seção
	 */
	showCta?: boolean
	/** @title Texto do CTA "ver todos" */
	ctaText?: string
	/** @title Destino do CTA "ver todos" */
	ctaAction?: CmsAction
	/** @title Banners */
	items?: BannerDuoItem[]
}

/**
 * Seção "Banner Duo": título + CTA opcional "ver todos" e uma lista de
 * banners lado a lado com scroll horizontal. Quando o conteúdo total
 * ultrapassa a largura visível, exibe uma barra de progresso horizontal
 * (trilho + preenchimento) refletindo a posição do scroll.
 */
export default function BannerDuo({ title, showCta = true, ctaText = 'ver todos', ctaAction, items = [] }: Props) {
	const showViewAll = showCta && !!ctaAction?.value
	const scrollRef = useRef<any>(null)
	const [showIndicator, setShowIndicator] = useState(false)
	const [thumb, setThumb] = useState({ ratio: 1, offset: 0 })

	// O `ref` num <View> (class component do luminus) aponta para a instância,
	// não para o <div>. Use getViewElement() para obter o elemento DOM real.
	const getScrollEl = () => {
		const view: any = scrollRef.current
		if (!view) return null
		return typeof view.getViewElement === 'function' ? view.getViewElement() : view
	}

	const measure = () => {
		const el = getScrollEl()
		if (!el) return
		const overflow = el.scrollWidth > el.clientWidth + 1
		setShowIndicator(overflow)
		if (overflow) {
			setThumb(prev => ({ ...prev, ratio: el.clientWidth / el.scrollWidth }))
		}
	}

	useEffect(() => {
		measure()
		// re-mede após o layout/imagens assentarem
		const raf = requestAnimationFrame(measure)
		window.addEventListener('resize', measure)
		return () => {
			cancelAnimationFrame(raf)
			window.removeEventListener('resize', measure)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [items?.length])

	const handleScroll = (e: any) => {
		const el = e.currentTarget
		const maxScroll = el.scrollWidth - el.clientWidth
		if (maxScroll <= 0) return
		const ratioPct = thumb.ratio * 100
		const offset = (el.scrollLeft / maxScroll) * (100 - ratioPct)
		setThumb(prev => ({ ...prev, offset }))
	}

	const handleBannerClick = (item: BannerDuoItem) => {
		if (item?.action?.value) processActions(item)
	}

	const handleCtaClick = () => {
		if (ctaAction?.value) processActions({ action: ctaAction })
	}

	if (!items?.length) return null

	return (
		<View className='flex flex-col'>
			{(title || showViewAll) && (
				<View className='flex items-center px-4 mb-2'>
					<SectionTitle title={title} className='!px-0 !mb-0 flex-1' />
					{showViewAll && (
						<View onClick={handleCtaClick} className='flex items-center min-w-fit text-neutral-content ml-2'>
							<Text className='underline text-neutral-content'>{ctaText}</Text>
							<ChevronRightIcon size={15} className='text-neutral-content ml-1' />
						</View>
					)}
				</View>
			)}

			<View
				ref={scrollRef}
				onScroll={handleScroll}
				className='flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
				<View className='flex gap-x-[2vw] px-4'>
					{items.map((item, index) => {
						const imageUrl = item.imageUrl || item.externalImageUrl
						return (
							<View key={index} className='flex flex-col w-[45vw] shrink-0'>
								<Image
									src={imageUrl}
									alt={item.alt || title || ''}
									onClick={() => handleBannerClick(item)}
									className='w-full aspect-[199/301] object-cover'
								/>
								{item.bannerTitle ? (
									<Text className='text-base font-bold text-gray-900 mt-2'>{item.bannerTitle}</Text>
								) : null}
								{item.bannerText ? (
									<Text className='text-sm text-gray-900 mt-1'>{item.bannerText}</Text>
								) : null}
							</View>
						)
					})}
				</View>
			</View>

			{showIndicator && (
				<View className='mx-4 mt-3'>
					<View className='flex w-full h-[3px] rounded-full bg-[#D9D5C9] overflow-hidden'>
						<View width={`${thumb.offset}%`} />
						<View width={`${thumb.ratio * 100}%`} className='h-full rounded-full bg-black' />
					</View>
				</View>
			)}
		</View>
	)
}
