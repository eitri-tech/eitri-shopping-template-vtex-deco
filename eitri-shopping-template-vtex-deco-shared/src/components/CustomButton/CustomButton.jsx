import Loading from '../Loading/LoadingComponent'

export default function CustomButton(props) {
	const {
		disabled,
		color,
		backgroundColor,
		variant,
		label,
		onPress,
		onClick,
		isLoading,
		width,
		borderRadius,
		className,
		outlined,
		children,
		leftIcon,
		...rest
	} = props

	const _onPress = () => {
		if (!disabled && onPress && typeof onPress === 'function') {
			onPress()
		}

		if (!disabled && onClick && typeof onClick === 'function') {
			onClick()
		}
	}

	const _backgroundColor = (() => {
		if (variant === 'outlined' || outlined) {
			return 'transparent'
		}
		return isLoading || disabled ? 'bg-gray-300' : 'bg-primary'
	})()

	const _contentColor = (() => {
		if (variant === 'outlined' || outlined) {
			return 'text-primary'
		}
		return isLoading || disabled ? 'text-gray-500' : 'text-primary-content'
	})()

	const renderContent = () => {
		if (leftIcon) {
			return (
				<View className='flex items-center gap-2'>
					<View className={_contentColor}>{leftIcon}</View>
					<Text className={`font-bold ${_contentColor}`}>{label}</Text>
				</View>
			)
		}

		return <Text className={`font-bold ${_contentColor}`}>{label}</Text>
	}

	return (
		<View
			onClick={_onPress}
			className={`
				flex items-center justify-center 
				h-[45px]
				rounded-lg
				w-full
				${_backgroundColor ? `${_backgroundColor}` : ''}
				${variant === 'outlined' || outlined ? `border border-primary border-2` : ''}
				${className || ''}
			`}
			{...rest}>
			{children || (isLoading ? <Loading /> : renderContent())}
		</View>
	)
}
