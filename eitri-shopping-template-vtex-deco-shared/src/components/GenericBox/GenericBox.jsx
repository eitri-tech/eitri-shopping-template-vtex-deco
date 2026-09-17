export default function GenericBox(props) {
	const { children, className, ...rest } = props

	return (
		<View className={`bg-white shadow-[0_1px_1px_0_rgba(0,0,0,0.045)] p-4 w-full ${className || ''}`} {...rest}>
			{children}
		</View>
	)
}
