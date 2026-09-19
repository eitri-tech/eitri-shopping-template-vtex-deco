import { Image, Text, View } from 'eitri-luminus'
import type { ReactNode } from 'react'
import type { ShelfCategory, CategoryShelf } from '../CategoryTree'

// View/Text have no `backgroundColor`/`fontFamily` props in their .d.ts — kept as-is
// (pre-existing, legacy props from an older API version).
const ViewAny = View as unknown as (props: Record<string, unknown> & { children?: ReactNode }) => JSX.Element
const TextAny = Text as unknown as (props: Record<string, unknown> & { children?: ReactNode }) => JSX.Element

interface ListWithImagesProps {
	currentShelf?: CategoryShelf
	chooseCategory: (category: ShelfCategory) => void
}

export default function ListWithImages(props: ListWithImagesProps) {
	const { currentShelf, chooseCategory } = props

	return (
		<View className='px-8 flex flex-col'>
			{currentShelf?.content?.map(category => (
				<ViewAny
					key={category.title}
					onClick={() => chooseCategory(category)}
					height='71px'
					backgroundColor={category.color}>
					<View
						width='100%'
						className='px-8 justify-between items-center flex'>
						<TextAny
							fontFamily='Baloo 2'
							className='text-base text-base-100 font-bold'>
							{category?.title}
						</TextAny>
						{category.thumbnail && (
							<View
								width='71px'
								height='71px'
								className='flex items-center justify-center p-2'>
								<Image
									src={category.thumbnail}
									maxHeight='100%'
									maxWidth='100%'
								/>
							</View>
						)}
					</View>
				</ViewAny>
			))}
		</View>
	)
}
