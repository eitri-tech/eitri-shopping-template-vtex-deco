import { View, Text } from 'eitri-luminus'
import { useState } from 'react'
import { processActions } from '../services/ResolveCmsActions'
import type { CmsAction } from './types'

export interface NavigateCategoryItem {
	/**
	 * @title Rótulo do chip.
	 */
	label?: string
	action?: CmsAction
}

export interface Props {
	/**
	 * @title Título da seção.
	 */
	title?: string
	items?: NavigateCategoryItem[]
}

export default function NavigateByCategories({ title, items = [] }: Props) {
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

	return (
		<View className='flex flex-col gap-3 px-4 pt-5'>
			{title ? <Text className='text-2xl font-bold text-gray-900'>{title}</Text> : null}
			<View className='flex flex-row gap-2 overflow-x-auto'>
				{items.map((item, index) => {
					const isActive = index === selectedIndex

					return (
						<View
							key={index}
							className={`flex-shrink-0 px-4 py-1 border border-gray-900 ${
								isActive ? 'bg-gray-900' : 'bg-white'
							}`}
							onClick={() => {
								setSelectedIndex(index)
								processActions(item)
							}}>
							<Text
								className={`text-sm font-medium whitespace-nowrap ${
									isActive ? 'text-white' : 'text-gray-900'
								}`}>
								{item.label}
							</Text>
						</View>
					)
				})}
			</View>
		</View>
	)
}
