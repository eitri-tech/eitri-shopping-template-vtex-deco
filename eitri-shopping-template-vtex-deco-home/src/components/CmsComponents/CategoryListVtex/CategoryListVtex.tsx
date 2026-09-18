import { useEffect, useRef, useState, ReactNode } from 'react'
import { View, Text } from 'eitri-luminus'
import { processActions } from '../../../services/ResolveCmsActions'
import { getCategoryTree } from '../../../services/ProductService'
import Eitri from 'eitri-bifrost'
import { HeaderText, Loading, ChevronLeftIcon, ChevronRightIcon } from 'eitri-shopping-template-vtex-deco-shared'
import type { CategoryNavItem } from '../CategoryListSwipe/components/CategoryPageItem'

// Raw shape returned by Vtex.catalog.getCategoryTree — its .d.ts types the whole call as
// Promise<any>, so this is a local reconstruction of the fields this component actually reads.
interface VtexCategoryTreeNode {
	id?: number | string
	name?: string
	url?: string
	hasChildren?: boolean
	children?: VtexCategoryTreeNode[]
	[key: string]: unknown
}

interface StackLevel {
	title: string | null
	items: CategoryNavItem[]
}

let cachedStack: StackLevel[] | null = null

interface CategoryItemProps {
	item: CategoryNavItem
	onClick: (item: CategoryNavItem) => void
}

function CategoryItem(props: CategoryItemProps) {
	const { item, onClick } = props
	const hasChildren = Boolean(item.subcategories && item.subcategories.length > 0)

	return (
		<View
			onClick={() => onClick(item)}
			className='flex items-center justify-between px-5 py-4 bg-white rounded-lg shadow-[0_4px_4px_0_rgba(0,0,0,0.078)]'>
			<Text className='text-stone-800 font-medium text-[15px] tracking-tight'>{item.title}</Text>
			{hasChildren && (
				<View className='text-stone-400 group-active:text-amber-500 transition-colors'>
					<ChevronRightIcon size={14} />
				</View>
			)}
		</View>
	)
}

interface CategoryListVtexData {
	exclusionList?: string
}

interface CategoryListVtexProps {
	data?: CategoryListVtexData
	setPageTitle?: (title: ReactNode) => void
	[key: string]: unknown
}

export default function CategoryListVtex(props: CategoryListVtexProps) {
	const { setPageTitle, data } = props
	const exclusionList = data?.exclusionList

	const [stack, setStack] = useState<StackLevel[]>(cachedStack ?? [{ title: null, items: [] }])
	const [animating, setAnimating] = useState(false)
	const [direction, setDirection] = useState<'forward' | 'back'>('forward')
	const [isLoading, setIsLoading] = useState(false)

	const stackLength = useRef(stack.length)

	useEffect(() => {
		stackLength.current = stack.length

		if (typeof setPageTitle === 'function') {
			const isRoot = stack.length === 1
			if (isRoot) {
				setPageTitle(<HeaderText text={'Categorias'} />)
			} else {
				const current = stack[stack.length - 1]
				setPageTitle(
					<View
						className={'flex items-center gap-2'}
						onClick={() => pop()}>
						<ChevronLeftIcon className={'text-primary-content'} />
						<HeaderText text={current?.title ?? ''} />
					</View>
				)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [stack.length])

	useEffect(() => {
		loadCategories()
		Eitri.navigation.addBackHandler(() => {
			if (stackLength.current > 1) {
				pop()
				return false
			}
			return true
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const buildExclusionSet = (raw?: string): Set<string> => {
		if (!raw) return new Set()
		return new Set(raw.split(';').map(item => item.trim().toLowerCase()))
	}

	const filterCategories = (categories: VtexCategoryTreeNode[], exclusionSet: Set<string>): VtexCategoryTreeNode[] => {
		if (exclusionSet.size === 0) return categories
		return categories
			.filter(cat => !exclusionSet.has(String(cat.id)) && !exclusionSet.has((cat.name ?? '').toLowerCase()))
			.map(cat => ({ ...cat, children: filterCategories(cat.children ?? [], exclusionSet) }))
	}

	const parseCategory = (category: VtexCategoryTreeNode, parentNames: string[] = []): CategoryNavItem => {
		const categoryNames = [...parentNames, category.name ?? '']
		const newCat: CategoryNavItem = {
			action: {
				type: 'category',
				sort: 'score:desc',
				value: category?.url ? new URL(category.url).pathname : '',
				title: category.name,
				categoryNames
			},
			title: category.name,
			subcategories: []
		}
		if (category.hasChildren) {
			;(category.children ?? []).forEach(subcategory => {
				newCat.subcategories?.push(parseCategory(subcategory, categoryNames))
			})
			newCat.subcategories?.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '', 'pt-BR'))
		}
		return newCat
	}

	const loadCategories = async () => {
		if (cachedStack) {
			return
		}

		setIsLoading(true)
		const categories = ((await getCategoryTree(10)) ?? []) as VtexCategoryTreeNode[]
		const exclusionSet = buildExclusionSet(exclusionList)
		const filtered = filterCategories(categories, exclusionSet)
		const newCat = filtered.map(category => parseCategory(category))
		newCat.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '', 'pt-BR'))

		cachedStack = [{ title: null, items: newCat }]
		setStack([{ title: null, items: newCat }])
		setIsLoading(false)
	}

	const push = (category: CategoryNavItem) => {
		if (!category.subcategories?.length || animating) {
			processActions(category)
			return
		}
		setDirection('forward')
		setAnimating(true)
		setTimeout(() => {
			setStack(prev => {
				const next = [...prev, { title: category.title ?? null, items: category.subcategories ?? [] }]
				cachedStack = next
				return next
			})

			setAnimating(false)
			window.scrollTo({ top: 0, behavior: 'smooth' })
		}, 220)
	}

	const pop = () => {
		if (stackLength.current <= 1 || animating) return
		setDirection('back')
		setAnimating(true)
		setTimeout(() => {
			setStack(prev => {
				const next = prev.slice(0, -1)
				cachedStack = next
				return next
			})
			setAnimating(false)
			window.scrollTo({ top: 0, behavior: 'smooth' })
		}, 220)
	}

	const current = stack[stack.length - 1]

	const slideStyle = animating
		? {
				transform: direction === 'forward' ? 'translateX(-50px)' : 'translateX(50px)',
				opacity: 0,
				transition: 'transform 0.22s cubic-bezier(.4,0,.2,1), opacity 0.22s ease'
			}
		: {
				transform: 'translateX(0)',
				opacity: 1,
				transition: 'transform 0.22s cubic-bezier(.4,0,.2,1), opacity 0.22s ease'
			}

	return (
		<View className='flex flex-col'>
			{isLoading && (
				<View className={'flex items-center justify-center p-4 '}>
					<Loading />
				</View>
			)}

			<View
				style={slideStyle}
				className='flex-1 flex flex-col gap-3 p-4'>
				{(current?.items ?? []).map((item, i) => (
					<CategoryItem
						key={i}
						item={item}
						onClick={push}
					/>
				))}
			</View>
		</View>
	)
}
