import { useTranslation } from 'eitri-i18n'
import { Skeleton, Text, View } from 'eitri-luminus'

export default function ShippingMethods(props) {
	const { onSelectFreightOption, options, loading = false, ...rest } = props

	const { t } = useTranslation()

	const handleMethodChange = option => {
		onSelectFreightOption(option)
	}

	if (!options || options.length === 0) {
		return null
	}

	return (
		<View {...rest}>
			<View className='flex flex-col gap-3'>
				{options.map(option => (
					<>
						{loading ? (
							<Skeleton className='w-full h-[40px]' />
						) : (
							<ShippingMethodCard
								key={option.label}
								option={option}
								isSelected={!!option.isCurrent}
								onClick={() => handleMethodChange(option)}
							/>
						)}
					</>
				))}
			</View>
		</View>
	)
}

function ShippingMethodCard({ option, isSelected = false, onClick }) {
	return (
		<View
			className={`rounded-lg shadow-sm transition-all duration-200 border cursor-pointer hover:shadow-md ${
				isSelected ? 'border-2 border-primary' : 'border-neutral-300 hover:border-primary/30 bg-base-100'
			}`}
			onClick={onClick}>
			<View className='p-4'>
				<View className='flex flex-row justify-between items-start'>
					<View className='flex flex-col gap-1 flex-1'>
						<Text className='font-semibold text-base-content text-base mb-1'>{option.label}</Text>

						<Text className='text-sm text-base-content/70 mb-1'>{option?.shippingEstimate}</Text>
					</View>

					<View className='flex flex-col items-end gap-1'>
						<Text className='font-semibold text-base-content text-lg'>{option.price}</Text>

						{isSelected && (
							<View className='flex items-center justify-center w-6 h-6 bg-primary rounded-full'>
								<svg
									width='12'
									height='12'
									viewBox='0 0 16 16'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'>
									<path
										d='M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z'
										fill='white'
									/>
								</svg>
							</View>
						)}
					</View>
				</View>
			</View>
		</View>
	)
}
