import type { ReactNode } from 'react'
import { View } from 'eitri-luminus'

interface GenericBoxProps {
	children?: ReactNode
	className?: string
	[key: string]: unknown
}

export default function GenericBox(props: GenericBoxProps) {
	const { children, className, ...rest } = props

	return (
		<View className={`bg-white shadow-[0_1px_1px_0_rgba(0,0,0,0.045)] p-4 w-full ${className || ''}`} {...rest}>
			{children}
		</View>
	)
}
