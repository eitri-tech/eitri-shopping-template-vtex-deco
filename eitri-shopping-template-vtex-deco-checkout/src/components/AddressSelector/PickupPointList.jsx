import { Loading, Skeleton, Text, View } from 'eitri-luminus'
import { useTranslation } from 'eitri-i18n'

export default function PickupPointList({ options, onSelectFreightOption, loading }) {
	const { t } = useTranslation()

	if (!options && loading) {
		return (
			<View className='flex flex-col gap-3'>
				{[1, 2, 3].map(i => (
					<Skeleton
						key={i}
						className='h-[72px] w-full rounded-lg mb-2'
					/>
				))}
			</View>
		)
	}

	if (!options) {
		return (
			<View className='flex flex-col items-center justify-center py-8'>
				<Loading />
			</View>
		)
	}

	if (options.length === 0 && !loading) {
		return (
			<View className='text-center py-8'>
				<Text className='text-base-content/50'>
					{t('addressSelector.noPickupPoints', 'Nenhum ponto de retirada disponível')}
				</Text>
			</View>
		)
	}

	const currentSelectedOption = options?.find(option => option.isCurrent)

	const handlePickupChange = option => {
		onSelectFreightOption(option)
	}

	return (
		<View>
			<View className='flex flex-col gap-1 mb-4'>
				<Text className='text-lg font-bold text-base-content'>
					{t('addressSelector.pickupTitle', 'Pontos de Retirada')}
				</Text>
				<Text className='text-sm text-base-content/70 mt-1'>
					{t('addressSelector.pickupSubtitle', 'Selecione um ponto de retirada')}
				</Text>
			</View>

			<View className='flex flex-col gap-3'>
				{loading
					? [1, 2, 3].map(i => (
							<Skeleton
								key={i}
								className='h-[72px] w-full rounded-lg mb-2'
							/>
						))
					: options.map((option, index) => (
							<PickupPointCard
								key={option.label || index}
								option={option}
								isSelected={!!option.isCurrent}
								onClick={() => handlePickupChange(option)}
							/>
						))}
			</View>
		</View>
	)
}

function PickupPointCard({ option, isSelected = false, onClick }) {
	// Exibe um cartão de ponto de retirada, destacando visualmente se está selecionado
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
						{option.address && (
							<Text className='text-sm text-base-content/70 mb-1'>{option?.address?.street}</Text>
						)}
					</View>
					<View className='flex flex-col items-end gap-1'>
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
