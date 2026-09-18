import { View, Text, Image } from 'eitri-luminus'
import SectionTitle from '../../../components/SectionTitle/SectionTitle'
import type { BannerData, BannerImage } from '../../types'

interface Props {
	data: BannerData
	onClick: (image: BannerImage) => void
}

interface Dimensions {
	width: string
	height: string
}

export default function BannerList({ data, onClick }: Props) {
	const imagesList = data.images || []
	const { size, aspectRatio, autoSize } = data
	const gap = data.gap ?? 8

	const autoSizeMap: Record<string, number> = {
		'three-one-half': 3.5,
		'four-three-four': 4.5,
		'five': 5
	}

	const getBannerDimensions = (): Dimensions => {
		if (autoSize && autoSizeMap[autoSize]) {
			const divisor = autoSizeMap[autoSize]
			const leftPadding = 16
			const itemGap = gap
			const visibleGaps = Math.floor(divisor)
			const autoWidth = (window.innerWidth - leftPadding - itemGap * visibleGaps) / divisor
			let finalHeight = size?.maxHeight || autoWidth
			if (aspectRatio) {
				try {
					const [aspectW, aspectH] = aspectRatio.split(':').map(Number)
					const numericRatio = aspectH / aspectW
					if (!isNaN(numericRatio)) {
						finalHeight = autoWidth * numericRatio
						if (size?.maxHeight && finalHeight > size.maxHeight) finalHeight = size.maxHeight
					}
				} catch (e) {}
			}

			return { width: `${autoWidth}px`, height: `${finalHeight}px` }
		}

		const maxWidth = size?.maxWidth
		const maxHeight = size?.maxHeight
		let finalWidth = maxWidth || 200
		let finalHeight = maxHeight || 200

		if (aspectRatio) {
			try {
				const [aspectW, aspectH] = aspectRatio.split(':').map(Number)
				const numericRatio = aspectH / aspectW
				if (!isNaN(numericRatio)) {
					const calculatedHeight = finalWidth * numericRatio
					if (maxHeight && calculatedHeight > maxHeight) {
						finalHeight = maxHeight
						finalWidth = maxHeight / numericRatio
					} else {
						finalHeight = calculatedHeight
					}
				}
			} catch (e) {}
		}

		return { width: `${finalWidth}px`, height: `${finalHeight}px` }
	}

	return (
		<View className='flex flex-col gap-2'>
			<SectionTitle title={data.mainTitle} />

			<View className='flex overflow-x-auto'>
				<View className='flex px-4 gap-2'>
					{imagesList.map(slider => {
						const dimensions = getBannerDimensions()
						const imageUrl = slider.imageUrl || slider.externalImageUrl
						return (
							<View
								key={imageUrl}
								className='flex flex-col'>
								<Image
									src={imageUrl}
									width={dimensions.width}
									height={dimensions.height}
									className='rounded object-cover'
									onClick={() => onClick(slider)}
								/>
								{slider?.subLabel && (
									<View
										width={dimensions.width}
										className='mt-1'>
										<Text className='font-bold line-clamp-2 block text-center'>{slider.subLabel}</Text>
									</View>
								)}
							</View>
						)
					})}
				</View>
			</View>
		</View>
	)
}
