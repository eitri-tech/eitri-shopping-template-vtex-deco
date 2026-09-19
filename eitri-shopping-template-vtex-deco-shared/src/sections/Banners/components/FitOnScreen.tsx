import { View, Text, Image } from 'eitri-luminus'
import SectionTitle from '../../../components/SectionTitle/SectionTitle'
import type { BannerData, BannerImage } from '../../types'

interface Props {
	data: BannerData
	onClick: (image: BannerImage) => void
}

export default function FitOnScreen({ data, onClick }: Props) {
	const imagesList = data.images || []

	return (
		<View>
			<SectionTitle title={data.mainTitle} />
			<View className={`flex justify-between ${imagesList.length > 1 ? 'px-4' : ''} gap-2`}>
				{imagesList.map(image => (
					<View
						key={image.imageUrl}
						onClick={() => onClick(image)}>
						<Image
							src={image.imageUrl ?? ''}
							className='rounded'
						/>
						{image.action?.title && <Text className='text-center mt-2'>{image.action.title}</Text>}
					</View>
				))}
			</View>
		</View>
	)
}
