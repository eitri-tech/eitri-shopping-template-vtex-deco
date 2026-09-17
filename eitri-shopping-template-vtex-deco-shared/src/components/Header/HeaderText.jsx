import { Text, View } from 'eitri-luminus'
export default function HeaderText(props) {
	const { text } = props
	return (
		<View>
			<Text className={`text-header-content text-xl font-bold line-clamp-1`}>{text}</Text>
		</View>
	)
}
