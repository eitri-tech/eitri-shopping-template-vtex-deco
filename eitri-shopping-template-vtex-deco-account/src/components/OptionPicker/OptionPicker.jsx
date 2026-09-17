import { FiCheck, FiX } from 'react-icons/fi'

export default function OptionPicker(props) {
	const { title, options, value, onSelect, onClose } = props

	if (!options) return null

	return (
		<View className='z-[9999] !bg-black/70 !opacity-100 fixed inset-0 flex items-end'>
			<View className='w-full bg-white rounded-t-2xl p-4 flex flex-col max-h-[70vh] overflow-y-auto'>
				<View className='flex justify-between items-center mb-2'>
					<Text className='font-bold text-lg text-gray-900'>{title}</Text>
					<View
						className='p-2'
						onClick={onClose}>
						<FiX
							size={20}
							className='text-gray-700'
						/>
					</View>
				</View>
				{options.map(option => {
					const selected = option.value === value
					return (
						<View
							key={option.value}
							className='flex justify-between items-center py-3 border-b border-gray-100'
							onClick={() => {
								onSelect(option.value)
								onClose()
							}}>
							<View className='flex flex-col'>
								<Text className={selected ? 'font-bold text-primary' : 'text-gray-800'}>
									{option.label}
								</Text>
								{option.description && (
									<Text className='text-xs text-gray-500'>{option.description}</Text>
								)}
							</View>
							{selected && (
								<FiCheck
									size={18}
									className='text-primary'
								/>
							)}
						</View>
					)
				})}
				<View
					bottomInset={'auto'}
					className='w-full'
				/>
			</View>
		</View>
	)
}
