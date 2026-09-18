import { View, Image } from 'eitri-luminus'
import { useState } from 'react'
import Slider from '../../../Slider/Slider'
import SliderPagination from '../../../components/SliderPagination/SliderPagination'
import SectionTitle from '../../../components/SectionTitle/SectionTitle'
import type { BannerData, BannerImage } from '../../types'

interface Props {
	data: BannerData
	onClick: (image: BannerImage) => void
}

export default function SliderHero({ data, onClick }: Props) {
	const [currentSlide, setCurrentSlide] = useState(0)
	const imagesList = data.images || []

	const parsedTimeout = Number(data?.autoPlayTimeout)
	const autoPlayTimeout = parsedTimeout > 0 ? parsedTimeout * 1000 : 5000

	let proportionalHeight: number | string = 'auto'

	if (data?.aspectRatio) {
		try {
			const [aspectWidth, aspectHeight] = data.aspectRatio.replace('x', ':').split(':').map(Number)
			const screenWidth = window.innerWidth
			proportionalHeight = screenWidth * (aspectHeight / aspectWidth)
		} catch (e) {}
	}

	return (
		<View className='relative'>
			<SectionTitle title={data.mainTitle} />
			<Slider
				options={{
					loop: imagesList.length === 1 ? false : data?.autoPlay,
					renderMode: 'performance',
					slideChanged(s) {
						setCurrentSlide(s.track.details.rel)
					}
				}}
				autoPlay={data?.autoPlay ?? true}
				autoPlayTimeout={autoPlayTimeout}>
				{imagesList.map(image => {
					const imageUrl = image.imageUrl || image.externalImageUrl
					return (
						<View
							className='keen-slider__slide'
							key={`image_${imageUrl}`}>
							<View
								onClick={() => onClick(image)}
								height={proportionalHeight}
								width='100%'>
								<Image
									fadeIn={1000}
									className='w-full h-full'
									src={imageUrl}
								/>
							</View>
						</View>
					)
				})}
			</Slider>

			<SliderPagination
				count={imagesList.length}
				activeIndex={currentSlide}
				className='absolute bottom-[12px] w-full'
			/>
		</View>
	)
}
