import { View, Image } from 'eitri-luminus'
import SectionTitle from '../../../SectionTitle/SectionTitle'
import type { BannerData, BannerImage } from '../Banner'

interface SingleBannerProps {
	data: BannerData
	onClick: (image: BannerImage) => void
}

export default function SingleBanner(props: SingleBannerProps) {
	const { data, onClick } = props

	const imagesList = data.images ?? []

	let proportionalHeight: string | number = 'auto'

	if (data?.aspectRatio) {
		try {
			const [aspectWidth, aspectHeight] = data.aspectRatio.split(':').map(Number)
			const screenWidth = window.innerWidth
			proportionalHeight = screenWidth * (aspectHeight / aspectWidth)
		} catch (e) {}
	}

	const firstImage = imagesList[0]
	const imageUrl = firstImage?.imageUrl || firstImage?.externalImageUrl

	return (
		<View className='relative '>
			<SectionTitle title={data.mainTitle} />

			{imageUrl && firstImage && (
				<View
					key={imageUrl}
					onClick={() => onClick(firstImage)}
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
