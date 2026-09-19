import { View } from 'eitri-luminus'

interface SpacingProps {
	height?: string | number
	width?: string | number
}

export default function Spacing(props: SpacingProps) {
	const { height, width } = props

	return <View className={`h-${height || '50'} w-${width || 'full'}`}></View>
}
