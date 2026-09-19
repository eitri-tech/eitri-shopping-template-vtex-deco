import { useState } from 'react'
import { View, Image } from 'eitri-luminus'
import { Slider } from 'eitri-shopping-template-vtex-deco-shared'
import type { VtexSku } from '../../types/vtex'

interface ImageCarouselProps {
	currentSku: VtexSku
}

export default function ImageCarousel(props: ImageCarouselProps) {
	const { currentSku } = props

	const [currentSlide, setCurrentSlide] = useState(0)
	const [fixedHeight, setFixedHeight] = useState(0)

	const IMAGE_FADE_TIME = 500

	const imageLoaded = () => {
		if (fixedHeight) return
		setTimeout(() => {
			const e = document.getElementById('keen-slider__slide-0')
			setFixedHeight(e?.offsetHeight ?? 0)
		}, IMAGE_FADE_TIME + 100) // Atraso devido ao fade da imagem
	}

	return (
		<View>
			<View
				className='relative'
				style={{
					minHeight: fixedHeight ? `${fixedHeight}px` : 'auto'
				}}>
				<Slider
					key={currentSku.itemId}
					options={{
						loop: true,
						renderMode: 'performance',
						slideChanged(s: { track: { details: { rel: number } } }) {
							setCurrentSlide(s.track.details.rel)
						}
					}}>
					{currentSku?.images?.map((item, index) => {
						return (
							<View
								key={item.imageUrl ?? index}
								id={`keen-slider__slide-${index}`}
								className={`flex justify-center items-center keen-slider__slide`}>
								{item.imageUrl && (
									<Image
										pinchZoom
										zoomMaxScale={8}
										fadeIn={IMAGE_FADE_TIME}
										onLoad={index === 0 ? imageLoaded : undefined}
										src={item.imageUrl}
										width='100vw'
									/>
								)}
							</View>
						)
					})}
				</Slider>
			</View>

			{(currentSku?.images?.length ?? 0) > 1 && (
				<View className='flex justify-center gap-2 mt-2'>
					{currentSku?.images?.map((_, index) => (
						<View
							key={index}
							className={`${currentSlide === index ? 'w-[36px]' : 'w-[12px]'} h-[6px] rounded-lg ${
								currentSlide === index ? 'bg-primary' : 'bg-base-300'
							} transition-[width,background-color] duration-300 ease-in-out"`}
						/>
					))}
				</View>
			)}
		</View>
	)
}
