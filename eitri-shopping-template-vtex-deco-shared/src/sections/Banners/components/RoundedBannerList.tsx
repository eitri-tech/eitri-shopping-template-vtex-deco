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

export default function RoundedBannerList({ data, onClick }: Props) {
	const { size } = data
	const imagesList = data.images || []

	const getBannerDimensions = (): Dimensions => {
		const maxWidth = size?.maxWidth
		const maxHeight = size?.maxHeight

		if (maxWidth || maxHeight) {
			if ((maxWidth || 0) > (maxHeight || 0)) {
				return { width: `${maxHeight}px`, height: `${maxHeight}px` }
			} else {
				return { width: `${maxWidth}px`, height: `${maxWidth}px` }
			}
		}

		return { width: `200px`, height: `200px` }
	}

	return (
		<View>
			<SectionTitle title={data.mainTitle} />
			<View className='flex flex-row overflow-x-scroll'>
				<View className='flex flex-row gap-4 px-4'>
					{imagesList.map(slider => {
						const dimensions = getBannerDimensions()
						return (
							<View
								key={slider.imageUrl}
								className='flex flex-col items-center'>
								<Image
									src={slider.imageUrl}
									width={dimensions.width}
									height={dimensions.height}
									className='rounded-full shadow-md object-cover'
									onClick={() => onClick(slider)}
								/>
								{slider?.action?.title && (
									<View className='pt-1'>
										<Text className='font-bold text-center line-clamp-2 leading-4'>
											{slider.action.title}
										</Text>
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
