import { GenericBox } from 'eitri-shopping-monte-carlo-shared'

export default function InfoCard(props) {
	const { customerData } = props

	return (
		<View className='p-4'>
			<GenericBox className='flex justify-between gap-3 p-4 w-full items-center'>
				<View className='flex items-center justify-center w-16 h-16 rounded-full bg-primary'>
					<Text className='text-2xl font-bold text-white'>
						{(customerData?.firstName ?? customerData?.email)?.charAt(0)?.toLocaleUpperCase()}
					</Text>
				</View>

				<View className='flex flex-col flex-1'>
					{customerData?.firstName && (
						<Text className='font-bold text-lg text-gray-800'>
							{`${customerData.firstName} ${customerData.lastName}`}
						</Text>
					)}

					{customerData?.email && <Text className='text-sm text-gray-600'>{customerData.email}</Text>}
				</View>
			</GenericBox>
		</View>
	)
}
