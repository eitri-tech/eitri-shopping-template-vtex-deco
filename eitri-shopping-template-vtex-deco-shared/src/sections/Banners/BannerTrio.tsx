import { useState } from 'react'
import type { ReactNode } from 'react'
import { Image, Text, View } from 'eitri-luminus'
import { processActions } from '../../services/ResolveCmsActions'
import Slider from '../../Slider/Slider'
import type { CmsAction } from '../types'
import type { ImageWidget } from '../../types/widgets'

// Text has no `fontFamily` prop in its .d.ts — kept as-is (pre-existing, likely a no-op at runtime).
const TextAny = Text as unknown as (props: Record<string, unknown> & { children?: ReactNode }) => JSX.Element

// Figma 413-427: viewport 440, card 298x424, gap 22, peek de 49 de cada lado
// -> perView = 440 / (298 + 22) = 1.375. Trilho 177 / thumb 66 (~0.37).
const PER_VIEW = 1.375
const SPACING = 22

export interface BannerTrioItem {
	/** @title URL da imagem */
	imageUrl?: ImageWidget
	/** @title URL externa da imagem (alternativa) */
	externalImageUrl?: string
	/** @title Texto alternativo da imagem (alt) */
	alt?: string
	/** @title Destino do link do card */
	action?: CmsAction
	/**
	 * @title Texto do botão sobre a imagem
	 * @description Deixe vazio para não exibir o botão neste card.
	 */
	ctaText?: string
}

export interface Props {
	/** @title Título da seção (ex.: "Casamentos") */
	title?: string
	/** @title Subtítulo da seção (ex.: "O Símbolo da Eternidade") */
	subtitle?: string
	/** @title Cards */
	items?: BannerTrioItem[]
}

/**
 * Seção "Banner Trio": título + subtítulo (mesma fonte, 60% de opacidade) e um
 * carrossel horizontal de cards só-imagem, com o card ativo centralizado e os
 * vizinhos aparecendo parcialmente nas laterais ("peek"). Cada card pode ter um
 * botão sobreposto na base. Abaixo do carrossel, uma barra de progresso
 * (trilho + preenchimento) no mesmo padrão do `BannerDuo`.
 *
 * App é WebView mobile-only — sem breakpoints de tablet/desktop.
 */
export default function BannerTrio({ title, subtitle, items = [] }: Props) {
	const [progress, setProgress] = useState(0)

	if (!items?.length) return null

	const thumbRatio = Math.min(1, PER_VIEW / items.length) * 100
	const thumbOffset = progress * (100 - thumbRatio)

	const handleCardClick = (item: BannerTrioItem) => {
		if (item?.action?.value) processActions(item)
	}

	return (
		<View className='flex flex-col w-full overflow-hidden'>
			{(title || subtitle) && (
				<View className='flex flex-col px-4 mb-4'>
					{title ? (
						<TextAny
							fontFamily='Inter'
							className='font-medium text-2xl leading-[29px] text-black'>
							{title}
						</TextAny>
					) : null}
					{subtitle ? (
						<TextAny
							fontFamily='Inter'
							className='font-medium text-2xl leading-[29px] text-black opacity-60'>
							{subtitle}
						</TextAny>
					) : null}
				</View>
			)}

			<Slider
				options={{
					loop: false,
					renderMode: 'performance',
					slides: { perView: PER_VIEW, spacing: SPACING, origin: 'center' },
					detailsChanged(s: any) {
						setProgress(s.track?.details?.progress ?? 0)
					}
				}}>
				{items.map((item, index) => {
					const imageUrl = item.imageUrl || item.externalImageUrl
					return (
						<View
							key={`banner_trio_${index}`}
							onClick={() => handleCardClick(item)}
							className='relative w-full'>
							{/* A proporção vai na própria <Image> (como no BannerDuo): num
							    wrapper vazio, se o `aspect-ratio` não for aplicado, a altura
							    colapsa e o card fica achatado. */}
							{imageUrl ? (
								<Image
									src={imageUrl}
									alt={item.alt || title || ''}
									fadeIn={1000}
									className='w-full aspect-[149/212] object-cover rounded-[15px]'
								/>
							) : null}
							{/* Botão medido no PNG do Figma (vem embutido no asset):
							    largura 45% do card, base a 8% da altura, sem border radius. */}
							{item.ctaText ? (
								<View className='absolute inset-x-0 bottom-[8%] flex justify-center'>
									<Text className='w-[45%] bg-[#FFC62D] text-black text-sm font-medium text-center py-1.5'>
										{item.ctaText}
									</Text>
								</View>
							) : null}
						</View>
					)
				})}
			</Slider>

			{items.length > 1 && (
				<View className='flex justify-center mt-4'>
					<View className='flex w-[177px] h-[5px] rounded-full bg-[#CECBC2] overflow-hidden'>
						<View width={`${thumbOffset}%`} />
						<View
							width={`${thumbRatio}%`}
							className='h-full rounded-full bg-black'
						/>
					</View>
				</View>
			)}
		</View>
	)
}
