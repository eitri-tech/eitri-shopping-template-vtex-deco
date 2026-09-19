import { Text, View } from 'eitri-luminus'

interface HeaderTextProps {
	text?: string
}

export default function HeaderText(props: HeaderTextProps) {
	const { text } = props
	return (
		<View>
			<Text className={`text-header-content text-xl font-bold line-clamp-1`}>{text}</Text>
		</View>
	)
}
