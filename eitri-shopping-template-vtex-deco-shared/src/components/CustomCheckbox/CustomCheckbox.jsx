export default function CustomCheckbox(props) {
	const { checked, onChange, label, align, justify } = props

	return (
		<View
			className={`flex flex-row ${align === 'center' ? 'items-center' : 'items-start'} ${justify === 'center' ? 'justify-center' : 'justify-start'}`}>
			<Checkbox
				checked={checked}
				className={'border border-gray-400 text-gray-400 rounded checkbox-primary'}
				onChange={() => onChange(!checked)}
			/>
			{label && (
				<View
					onClick={() => onChange(!checked)}
					className='ml-2'>
					<Text className='w-full text text-gray-600'>{label}</Text>
				</View>
			)}
		</View>
	)
}
