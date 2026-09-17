import { Text, View } from 'eitri-luminus'
import SectionTitle from '../../../SectionTitle/SectionTitle'
export default function BannerList(props) {
	const { data, onClick } = props
	const imagesList = data.images
	const { size, aspectRatio, gap, autoSize } = data

	const autoSizeMap = {
		'three-one-half': 3.5,
		'four-three-four': 4.5,
		'five': 5
	}

	const getBannerDimensions = () => {
		if (autoSize && autoSizeMap[autoSize]) {
			const divisor = autoSizeMap[autoSize]
			const leftPadding = 16
			const itemGap = gap ?? 8
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
				<View
					style={{ gap: `${gap ?? 8}px` }}
					className='flex px-4'>
					{imagesList &&
						imagesList.map(slider => (
							<View
								key={slider.imageUrl || slider.externalImageUrl}
								className='flex flex-col'>
								<View // Adicionado key para melhor performance e para seguir as boas práticas do React
									style={{
										backgroundImage: `url(${slider.imageUrl || slider.externalImageUrl})`,
										...getBannerDimensions(),
										backgroundSize: 'cover'
									}}
									className={'rounded'}
									onClick={() => onClick(slider)}
								/>
								{slider?.subLabel && (
									<View
										style={{
											...getBannerDimensions(),
											height: 'initial'
										}}
										className='mt-1'>
										<Text className='font-bold line-clamp-2 block text-center'>
											{slider?.subLabel}
										</Text>
									</View>
								)}
							</View>
						))}
				</View>
			</View>
		</View>
	)
}
