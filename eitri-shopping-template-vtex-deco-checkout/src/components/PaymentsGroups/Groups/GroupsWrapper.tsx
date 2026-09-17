import type { ReactNode } from 'react'
import { Text, View } from 'eitri-luminus'
import { GenericBox } from 'eitri-shopping-template-vtex-deco-shared'

interface GroupsWrapperProps {
	title?: string
	subtitle?: string
	icon?: ReactNode
	children?: ReactNode
	onPress?: () => void
	className?: string
}

export default function GroupsWrapper(props: GroupsWrapperProps) {
	const { title, subtitle, icon, children, onPress, className } = props

	return (
		<GenericBox className={`p-4 ${className || ''}`}>
			<View
				onClick={onPress}
				className='w-full flex flex-col'>
				<View className='flex flex-row items-top gap-3'>
					<View className='py-1'>{icon}</View>
					<View className='flex flex-col'>
						<Text className='text font-bold'>{title ?? ''}</Text>
						{subtitle && <Text className='text-sm'>{subtitle}</Text>}
					</View>
				</View>
			</View>
			{children && <View className='mt-4'>{children}</View>}
		</GenericBox>
	)
}
