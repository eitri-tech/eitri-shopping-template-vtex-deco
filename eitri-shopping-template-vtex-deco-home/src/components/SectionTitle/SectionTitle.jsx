export default function SectionTitle(props) {
	const { title, className } = props

	if (!title) return null

	return (
		<View className={`mb-2 px-4 ${className || ''}`}>
			<Text
				fontFamily='Inter'
				className='font-semibold text-2xl text-black'>
				{title}
			</Text>
		</View>
	)
}
