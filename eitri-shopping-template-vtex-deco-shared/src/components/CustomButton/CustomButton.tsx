import type { ReactNode } from 'react'
import { Text, View } from 'eitri-luminus'
import Loading from '../Loading/LoadingComponent'

interface CustomButtonProps {
	disabled?: boolean
	color?: string
	backgroundColor?: string
	variant?: 'outlined' | string
	// Rendered as a child node, so any ReactNode works — checkout's AddressTypeTabs passes an icon+text View.
	label?: ReactNode
	onPress?: () => void
	// Called with no arguments below — consumers expecting a MouseEvent won't get one.
	onClick?: () => void
	isLoading?: boolean
	width?: string | number
	// Tailwind classes (e.g. 'h-[40px]', 'rounded-full'), not CSS values.
	borderRadius?: string
	height?: string
	bold?: boolean
	textClassName?: string
	className?: string
	outlined?: boolean
	children?: ReactNode
	leftIcon?: ReactNode
	[key: string]: unknown
}

export default function CustomButton(props: CustomButtonProps) {
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
		height,
		className,
		outlined,
		children,
		leftIcon,
		bold = true,
		textClassName,
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

	const _fontWeight = bold ? 'font-bold' : 'font-normal'

	const renderContent = () => {
		if (leftIcon) {
			return (
				<View className='flex items-center gap-2'>
					<View className={_contentColor}>{leftIcon}</View>
					<Text className={`${_fontWeight} ${_contentColor} ${textClassName || ''}`}>{label}</Text>
				</View>
			)
		}

		return <Text className={`${_fontWeight} ${_contentColor} ${textClassName || ''}`}>{label}</Text>
	}

	return (
		<View
			onClick={_onPress}
			className={`
				flex items-center justify-center
				${height || 'h-[45px]'}
				${borderRadius || ''}
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
