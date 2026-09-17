export default function CategoryTitle(props) {
	const { onClick, title, icon, hasSubItems } = props

	return (
		<View
			onClick={onClick}
			className='p-4 flex justify-between items-center bg-white'>
			<View className='flex items-center gap-4'>
				{icon && (
					<Image
						className='max-w-[30px]'
						src={icon}
					/>
				)}
				<Text className='font-bold'>{title}</Text>
			</View>
			<svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M1.38892 1.38889L7.63892 7.63889L1.38892 13.8889" stroke="#0C0C0C" stroke-width="2.77778" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</View>
	)
}
