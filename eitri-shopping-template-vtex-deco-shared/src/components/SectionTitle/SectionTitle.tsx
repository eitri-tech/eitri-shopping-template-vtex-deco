import { View, Text } from 'eitri-luminus'

export interface Props {
	title?: string
	className?: string
}

export default function SectionTitle({ title, className }: Props) {
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
