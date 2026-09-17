export default function GenericBox(props) {
	const { children, className, ...rest } = props

	return (
		<View className={`bg-white rounded-lg shadow-[0_4px_4px_0_rgba(0,0,0,0.078)] p-4 w-full ${className || ''}`} {...rest}>
			{children}
		</View>
	)
}
