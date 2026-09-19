import { Text, View, Image } from 'eitri-luminus'
import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import Eitri from 'eitri-bifrost'
import { Vtex } from 'eitri-shopping-vtex-shared'
import { resolveNavigation } from '../services/NavigationService'
import type { ImageWidget } from '../types/widgets'

// View/Text have no `backgroundColor`/`borderColor`/`borderBottomWidth`/`fontFamily` props in
// their .d.ts — kept as-is (pre-existing, legacy props from an older API version).
const ViewAny = View as unknown as (props: Record<string, unknown> & { children?: ReactNode }) => JSX.Element
const TextAny = Text as unknown as (props: Record<string, unknown> & { children?: ReactNode }) => JSX.Element

export interface CategoryTreeItem {
	/**
	 * @title Título.
	 */
	title?: string
	facets?: any
	/**
	 * @title Cor de fundo.
	 */
	color?: string
	/**
	 * @title Thumbnail (URL).
	 */
	thumbnail?: ImageWidget
}

export interface CategoryTreeShelf {
	/**
	 * @title Título da aba.
	 */
	title?: string
	/**
	 * @title Exibir como lista simples.
	 */
	showAsSimpleItem?: boolean
	content?: CategoryTreeItem[]
}

export interface Props {
	shelves?: CategoryTreeShelf[]
}

interface ListProps {
	currentShelf: CategoryTreeShelf
	chooseCategory: (category: CategoryTreeItem) => void
}

function ListWithImages({ currentShelf, chooseCategory }: ListProps) {
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

function SimpleList({ currentShelf, chooseCategory }: ListProps) {
	const totalLength = currentShelf?.content?.length || 0
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

export default function CategoryTree({ shelves = [] }: Props) {
	const [currentShelf, setCurrentShelf] = useState<CategoryTreeShelf | null>(null)
	const legacySearch = (Vtex?.configs as { searchOptions?: { legacySearch?: boolean } } | undefined)?.searchOptions
		?.legacySearch

	useEffect(() => {
		if (shelves.length) {
			setCurrentShelf(shelves[0])
		}
	}, [shelves])

	const onChooseShelf = (shelf: CategoryTreeShelf) => {
		setCurrentShelf(shelf)
	}

	const chooseCategory = (category: CategoryTreeItem) => {
		if (legacySearch) {
			Eitri.navigation.navigate({
				path: 'ProductCatalog',
				state: {
					facets: category.facets,
					title: category.title
				}
			})
			return
		}
		resolveNavigation(category.facets)
	}

	const showTabs = shelves.length > 1 || (shelves.length === 1 && !!shelves[0].title)

	return (
		<>
			{showTabs && (
				<View className='overflow-x-auto flex px-8'>
					{shelves.map(shelf =>
						shelf.title ? (
							<ViewAny
								minWidth='fit-content'
								key={shelf.title}
								onClick={() => onChooseShelf(shelf)}
								backgroundColor={shelf.title === currentShelf?.title ? 'secondary-500' : 'neutral-100'}
								borderColor={shelf.title === currentShelf?.title ? 'secondary-500' : 'neutral-300'}
								className='py-1 border'>
								<Text color={shelf.title === currentShelf?.title ? 'secondary-500' : 'neutral-300'}>
									{shelf.title}
								</Text>
							</ViewAny>
						) : null
					)}
				</View>
			)}
			{currentShelf &&
				(currentShelf.showAsSimpleItem ? (
					<SimpleList
						currentShelf={currentShelf}
						chooseCategory={chooseCategory}
					/>
				) : (
					<ListWithImages
						currentShelf={currentShelf}
						chooseCategory={chooseCategory}
					/>
				))}
		</>
	)
}
