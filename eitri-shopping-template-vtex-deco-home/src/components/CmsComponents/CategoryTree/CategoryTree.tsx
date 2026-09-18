import { useEffect, useState, Fragment, ReactNode } from 'react'
import Eitri from 'eitri-bifrost'
import { Text, View } from 'eitri-luminus'
import { Vtex } from 'eitri-shopping-vtex-shared'
import { resolveNavigation } from '../../../services/NavigationService'
import ListWithImages from './components/ListWithImages'
import SimpleList from './components/SimpleList'

// View/Text have no `backgroundColor`/`borderColor` props in their .d.ts — kept as-is
// (pre-existing, legacy props from an older API version).
const ViewAny = View as unknown as (props: Record<string, unknown> & { children?: ReactNode }) => JSX.Element
const TextAny = Text as unknown as (props: Record<string, unknown> & { children?: ReactNode }) => JSX.Element

export interface ShelfCategory {
	title?: string
	facets?: string
	color?: string
	thumbnail?: string
	[key: string]: unknown
}

export interface CategoryShelf {
	title?: string
	showAsSimpleItem?: boolean
	content?: ShelfCategory[]
	[key: string]: unknown
}

interface CategoryTreeData {
	shelves?: CategoryShelf[]
}

interface CategoryTreeProps {
	data?: CategoryTreeData
	[key: string]: unknown
}

export default function CategoryTree(props: CategoryTreeProps) {
	const { data } = props
	const [currentShelf, setCurrentShelf] = useState<CategoryShelf | null>(null)
	// Vtex.configs is typed loosely by the generated shared-library stub — same "shared-library
	// @types cache trap" as elsewhere in this codebase.
	const legacySearch = (Vtex as any)?.configs?.searchOptions?.legacySearch

	useEffect(() => {
		if (data?.shelves) {
			setCurrentShelf(data.shelves[0] ?? null)
		}
	}, [data?.shelves])

	const onChooseShelf = (shelf: CategoryShelf) => {
		setCurrentShelf(shelf)
	}

	const chooseCategory = (category: ShelfCategory) => {
		if (legacySearch) {
			console.log('chooseCategory >> legacySearch >>', JSON.stringify(category))
			Eitri.navigation.navigate({
				path: 'ProductCatalog',
				state: {
					facets: category.facets,
					title: category.title
				}
			})
			return
		}
		resolveNavigation(category.facets ?? '', category.title)
	}

	const shelves = data?.shelves ?? []

	return (
		<>
			{(shelves.length > 1 || (shelves.length === 1 && shelves[0].title)) && (
				<View className='overflow-x-auto flex px-8'>
					{shelves.map(shelf => (
						<Fragment key={shelf.title}>
							{shelf.title && (
								<ViewAny
									minWidth='fit-content'
									onClick={() => onChooseShelf(shelf)}
									backgroundColor={
										shelf.title === currentShelf?.title ? 'secondary-500' : 'neutral-100'
									}
									borderColor={shelf.title === currentShelf?.title ? 'secondary-500' : 'neutral-300'}
									className='py-1 border'>
									<TextAny color={shelf.title === currentShelf?.title ? 'secondary-500' : 'neutral-300'}>
										{shelf.title}
									</TextAny>
								</ViewAny>
							)}
						</Fragment>
					))}
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
