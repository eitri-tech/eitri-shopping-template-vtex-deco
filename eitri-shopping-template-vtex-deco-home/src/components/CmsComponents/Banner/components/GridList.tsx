import { Text, View, Image } from 'eitri-luminus'
import SectionTitle from '../../../SectionTitle/SectionTitle'
import type { BannerData, BannerImage } from '../Banner'

interface GridListProps {
	data: BannerData
	onClick: (image: BannerImage) => void
}

export default function GridList(props: GridListProps) {
	const { data, onClick } = props
	const imagesList = data?.images ?? []

	const gap = data.gap || 8

	return (
		<View>
			<SectionTitle title={data.mainTitle} />
			<View
				style={{ gap: `${gap}px` }}
				className='grid grid-cols-2 px-4'>
				{imagesList.map(image => (
					<View
						key={image.imageUrl || image.externalImageUrl}
						onClick={() => onClick(image)}
						className=''>
						<Image
							src={image.imageUrl || image.externalImageUrl || ''}
							className='w-full h-auto rounded'
						/>
						{image.subLabel && (
							<Text className='block text-sm font-bold text-center mt-1 text-gray-700'>{image.subLabel}</Text>
						)}
					</View>
				))}
			</View>
		</View>
	)
}
