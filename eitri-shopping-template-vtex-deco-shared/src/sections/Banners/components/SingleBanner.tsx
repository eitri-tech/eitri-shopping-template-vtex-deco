import { View, Image } from 'eitri-luminus'
import SectionTitle from '../../../components/SectionTitle/SectionTitle'
import type { BannerData, BannerImage } from '../../types'

interface Props {
	data: BannerData
	onClick: (image: BannerImage) => void
}

export default function SingleBanner({ data, onClick }: Props) {
	const imagesList = data.images || []

	let proportionalHeight: number | string = 'auto'

	if (data?.aspectRatio) {
		try {
			const [aspectWidth, aspectHeight] = data.aspectRatio.split(':').map(Number)
			const screenWidth = window.innerWidth
			proportionalHeight = screenWidth * (aspectHeight / aspectWidth)
		} catch (e) {}
	}

	const imageUrl = imagesList?.[0]?.imageUrl || imagesList?.[0]?.externalImageUrl

	return (
		<View className='relative'>
			<SectionTitle title={data.mainTitle} />

			{imageUrl && (
				<View
					key={imageUrl}
					onClick={() => onClick(imagesList[0])}
					height={proportionalHeight}
					className='px-4 flex flex-row w-full'>
					<Image
						src={imageUrl}
						className='w-full h-full rounded'
					/>
				</View>
			)}
		</View>
	)
}
