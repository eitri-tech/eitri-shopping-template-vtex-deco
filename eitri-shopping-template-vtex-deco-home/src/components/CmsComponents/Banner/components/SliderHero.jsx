import { Text, View, Image } from 'eitri-luminus'
import { Slider } from 'eitri-shopping-template-vtex-deco-shared'
import SectionTitle from '../../../SectionTitle/SectionTitle'

export default function SliderHero(props) {
	const { data, onClick } = props

	const [currentSlide, setCurrentSlide] = useState(0)
	const imagesList = data.images

	let proportionalHeight = 'auto'

	if (data?.aspectRatio) {
		try {
			const [aspectWidth, aspectHeight] = data?.aspectRatio?.replace('x', ':')?.split(':')?.map(Number)
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
				autoPlayTimeout={2000}>
				{imagesList &&
					imagesList.map(image => {
						const imageUrl = image.imageUrl || image.externalImageUrl
						return (
							<View
								className='keen-slider__slide'
								key={`image_${imageUrl}`}>
								<View
									onClick={() => {
										onClick(image)
									}}
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

			{imagesList.length > 1 && (
				<View className='absolute bottom-[12px] w-full flex justify-center gap-[12px] mt-2'>
					{imagesList.map((_, index) => (
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
