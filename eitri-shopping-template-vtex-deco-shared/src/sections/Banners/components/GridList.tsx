import { View, Text, Image } from 'eitri-luminus'
import SectionTitle from '../../../components/SectionTitle/SectionTitle'
import type { BannerData, BannerImage } from '../../types'

interface Props {
	data: BannerData
	onClick: (image: BannerImage) => void
}

export default function GridList({ data, onClick }: Props) {
	const imagesList = data?.images || []

	return (
		<View>
			<SectionTitle title={data.mainTitle} />
			<View className='grid grid-cols-2 px-4 gap-2'>
				{imagesList.map(image => (
					<View
						key={image.imageUrl || image.externalImageUrl}
						onClick={() => onClick(image)}>
						<Image
							src={image.imageUrl || image.externalImageUrl}
							className='w-full h-auto rounded'
						/>
						{image.subLabel && (
							<Text className='block text-sm font-bold text-center mt-1 text-gray-700'>
								{image.subLabel}
							</Text>
						)}
					</View>
				))}
			</View>
		</View>
	)
}
