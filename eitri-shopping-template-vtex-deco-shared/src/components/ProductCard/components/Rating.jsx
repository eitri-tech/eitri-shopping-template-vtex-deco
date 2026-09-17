import { FaStar } from 'react-icons/fa'

export default function Rating(props) {
	const { ratingValue, ratingsCount } = props

	return (
		<View className='flex items-center gap-1'>
			<View className='flex flex-row items-center gap-[4px]'>
				{[1, 2, 3, 4, 5].map((star, index) => {
					const fillPercentage = Math.min(Math.max((ratingValue - index) * 100, 0), 100)

					return (
						<View
							key={index}
							className='flex flex-row items-center'>
							<View className='relative'>
								{/* Estrela vazia (contorno) */}
								<FaStar
									solid
									size={16}
									className={'text-gray-200'}
								/>

								{/* Estrela preenchida (com clip proporcional) */}
								<View
									className='absolute top-0 left-0 overflow-hidden'
									style={{ width: `${fillPercentage}%` }}>
									<FaStar
										solid
										size={16}
										className={'text-[#F2C832]'}
									/>
								</View>
							</View>
						</View>
					)
				})}
			</View>
			{ratingsCount != null && <Text className='text-gray-400 text-xs'>{`${ratingValue?.toFixed(1)}`}</Text>}
		</View>
	)
}
