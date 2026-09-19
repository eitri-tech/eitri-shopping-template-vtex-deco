import { Text, View } from 'eitri-luminus'
import type { ReactNode } from 'react'
import type { ShelfCategory, CategoryShelf } from '../CategoryTree'

// View/Text have no `borderBottomWidth`/`fontFamily` props in their .d.ts — kept as-is
// (pre-existing, legacy props from an older API version).
const ViewAny = View as unknown as (props: Record<string, unknown> & { children?: ReactNode }) => JSX.Element
const TextAny = Text as unknown as (props: Record<string, unknown> & { children?: ReactNode }) => JSX.Element

interface SimpleListProps {
	currentShelf?: CategoryShelf
	chooseCategory: (category: ShelfCategory) => void
}

export default function SimpleList(props: SimpleListProps) {
	const { currentShelf, chooseCategory } = props
	const totalLength = currentShelf?.content?.length ?? 0
	const half = totalLength % 2 === 0 ? totalLength / 2 : (totalLength + 1) / 2

	return (
		<View className='px-8 flex'>
			<View width='50%'>
				{currentShelf?.content?.slice(0, half).map(category => (
					<ViewAny
						key={category.title}
						onClick={() => chooseCategory(category)}
						borderBottomWidth='hairline'
						width='100%'
						className='py-1 border-neutral'>
						<TextAny fontFamily='Baloo 2'>{category?.title}</TextAny>
					</ViewAny>
				))}
			</View>
			<View width='50%'>
				{currentShelf?.content?.slice(half, totalLength).map(category => (
					<ViewAny
						key={category.title}
						onClick={() => chooseCategory(category)}
						borderBottomWidth='hairline'
						width='100%'
						className='py-1 border-neutral'>
						<TextAny fontFamily='Baloo 2'>{category?.title}</TextAny>
					</ViewAny>
				))}
			</View>
		</View>
	)
}
