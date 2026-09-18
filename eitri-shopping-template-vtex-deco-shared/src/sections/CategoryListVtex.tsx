import { View, Text } from 'eitri-luminus'
import { useState, useRef, useEffect } from 'react'
import Eitri from 'eitri-bifrost'
import { processActions } from '../services/ResolveCmsActions'
import { getCategoryTree } from '../services/ProductService'
import Loading from '../components/Loading/LoadingComponent'
import ChevronLeftIcon from '../components/ChevronLeftIcon/ChevronLeftIcon'
import ChevronRightIcon from '../components/ChevronRightIcon/ChevronRightIcon'
import type { CmsAction } from './types'

export interface Props {
	/**
	 * @title Lista de exclusão (ids/nomes separados por ";").
	 */
	exclusionList?: string
}

interface CategoryNode {
	action: CmsAction
	title: string
	subcategories: CategoryNode[]
}

interface StackLevel {
	title: string | null
	items: CategoryNode[]
}

const CategoryItem = ({ item, onClick }: { item: CategoryNode; onClick: (item: CategoryNode) => void }) => {
	const hasChildren = item.subcategories && item.subcategories.length > 0

	return (
		<View
			onClick={() => onClick(item)}
			className='flex items-center justify-between px-5 py-4 bg-white rounded-lg shadow-[0_4px_4px_0_rgba(0,0,0,0.078)]'>
			<Text className='text-stone-800 font-medium text-[15px] tracking-tight'>{item.title}</Text>
			{hasChildren && (
				<View className='text-stone-400 transition-colors'>
					<ChevronRightIcon size={14} />
				</View>
			)}
		</View>
	)
}

let cachedStack: StackLevel[] | null = null

export default function CategoryListVtex({ exclusionList }: Props) {
	const [stack, setStack] = useState<StackLevel[]>(cachedStack ?? [{ title: null, items: [] }])
	const [animating, setAnimating] = useState(false)
	const [direction, setDirection] = useState<'forward' | 'back'>('forward')
	const [isLoading, setIsLoading] = useState(false)

	const stackLength = useRef(stack.length)

	useEffect(() => {
		stackLength.current = stack.length
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
	}, [])

	const buildExclusionSet = (raw?: string) => {
		if (!raw) return new Set<string>()
		return new Set(raw.split(';').map(item => item.trim().toLowerCase()))
	}

	const filterCategories = (categories: any[], exclusionSet: Set<string>): any[] => {
		if (exclusionSet.size === 0) return categories
		return categories
			.filter(cat => !exclusionSet.has(String(cat.id)) && !exclusionSet.has(cat.name?.toLowerCase()))
			.map(cat => ({ ...cat, children: filterCategories(cat.children ?? [], exclusionSet) }))
	}

	const parseCategory = (category: any, parentNames: string[] = []): CategoryNode => {
		const categoryNames = [...parentNames, category.name]
		const newCat: CategoryNode = {
			action: {
				type: 'category',
				sort: 'score:desc',
				value: new URL(category?.url).pathname,
				title: category.name,
				categoryNames
			},
			title: category.name,
			subcategories: []
		}
		if (category.hasChildren) {
			category.children.forEach((subcategory: any) => {
				newCat.subcategories.push(parseCategory(subcategory, categoryNames))
			})
			newCat.subcategories.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
		}
		return newCat
	}

	const loadCategories = async () => {
		if (cachedStack) {
			return
		}

		setIsLoading(true)
		const categories = await getCategoryTree(10)
		const exclusionSet = buildExclusionSet(exclusionList)
		const filtered = filterCategories(categories, exclusionSet)
		const newCat = filtered.map(category => parseCategory(category))
		newCat.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))

		cachedStack = [{ title: null, items: newCat }]
		setStack([{ title: null, items: newCat }])
		setIsLoading(false)
	}

	const push = (category: CategoryNode) => {
		if (!category.subcategories?.length || animating) {
			processActions(category)
			return
		}
		setDirection('forward')
		setAnimating(true)
		setTimeout(() => {
			setStack(prev => {
				cachedStack = [...prev, { title: category.title, items: category.subcategories }]
				return [...prev, { title: category.title, items: category.subcategories }]
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
				cachedStack = prev.slice(0, -1)
				return prev.slice(0, -1)
			})
			setAnimating(false)
			window.scrollTo({ top: 0, behavior: 'smooth' })
		}, 220)
	}

	const current = stack[stack.length - 1]
	const isRoot = stack.length === 1

	const slideClass = `transition-[transform,opacity] duration-[220ms] ease-[cubic-bezier(.4,0,.2,1)] ${
		animating
			? `${direction === 'forward' ? '-translate-x-[50px]' : 'translate-x-[50px]'} opacity-0`
			: 'translate-x-0 opacity-100'
	}`

	return (
		<View className='flex flex-col'>
			{!isRoot && (
				<View
					className='flex items-center gap-2 px-4 py-3'
					onClick={() => pop()}>
					<ChevronLeftIcon className='text-primary-content' />
					<Text className='font-bold'>{current.title}</Text>
				</View>
			)}

			{isLoading && (
				<View className='flex items-center justify-center p-4'>
					<Loading />
				</View>
			)}

			<View className={`flex-1 flex flex-col gap-3 p-4 ${slideClass}`}>
				{current.items.map((item, i) => (
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
