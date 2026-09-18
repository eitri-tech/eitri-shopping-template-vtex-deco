import { Text, View } from 'eitri-luminus'

interface SectionTitleProps {
	title?: string
	className?: string
}

export default function SectionTitle(props: SectionTitleProps) {
	const { title, className } = props

	if (!title) return null

	return (
		<View className={`mb-2 px-4 ${className || ''}`}>
			<Text className='font-bold text-xl text-gray-600'>{title}</Text>
		</View>
	)
}
