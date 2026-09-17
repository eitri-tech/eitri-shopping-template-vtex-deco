import { View, Text, Image } from 'eitri-luminus'

interface AlertProps {
	message?: string
	colorMessage?: string
	backgroundColor?: string
	iconKey?: string
	colorIcon?: string
}

export default function Alert(props: AlertProps) {
	const { message, colorMessage, backgroundColor, iconKey, colorIcon } = props

	return (
		<View className={`mt-2 ${backgroundColor ?? ''} rounded flex gap-3.5 items-center p-2`}>
			{iconKey && (
				<Image
					src={iconKey}
					className={colorIcon ?? ''}
					width={20}
					height={20}
				/>
			)}
			<Text className={`text-${colorMessage ?? ''}`}>{message ?? ''}</Text>
		</View>
	)
}
