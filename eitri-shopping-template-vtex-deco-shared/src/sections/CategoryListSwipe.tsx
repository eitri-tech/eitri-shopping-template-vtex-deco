import { View, Text, Image } from 'eitri-luminus'
import { useState, useEffect } from 'react'
import Eitri from 'eitri-bifrost'
import HeaderReturn from '../components/Header/HeaderReturn'
import HeaderContentWrapper from '../components/Header/HeaderContentWrapper'
import HeaderText from '../components/Header/HeaderText'
import { processActions } from '../services/ResolveCmsActions'
import type { CmsAction } from './types'
import type { ImageWidget } from '../types/widgets'

/**
 * Deco gera o formulário do admin inlinando os tipos TypeScript e corta a
 * recursão de tipos auto-referenciados — por isso um único `CategoryNode` com
 * `subcategories?: CategoryNode[]` deixa o formulário do item aninhado vazio.
 * Quebramos a recursão em níveis explícitos para que cada nível renderize seu
 * próprio formulário. Os shapes continuam compatíveis em runtime.
 */
export interface CategoryLeaf {
	/**
	 * @title Título.
	 */
	title?: string
	/**
	 * @title Ícone (URL).
	 */
	icon?: ImageWidget
	action?: CmsAction
}

export interface CategorySubItem {
	/**
	 * @title Título.
	 */
	title?: string
	/**
	 * @title Ícone (URL).
	 */
	icon?: ImageWidget
	action?: CmsAction
	/**
	 * @title Subcategorias.
	 */
	subcategories?: CategoryLeaf[]
}

export interface CategoryNode {
	/**
	 * @title Título.
	 */
	title?: string
	/**
	 * @title Ícone (URL).
	 */
	icon?: ImageWidget
	action?: CmsAction
	/**
	 * @title Subcategorias.
	 */
	subcategories?: CategorySubItem[]
}

export interface Props {
	content?: CategoryNode[]
}

/**
 * Tipo recursivo usado apenas em runtime (não exportado, portanto não
 * participa da geração do formulário do Deco). Cobre navegação em qualquer
 * profundidade da árvore montada a partir de `content`.
 */
interface RuntimeCategory {
	title?: string
	icon?: string
	action?: CmsAction
	subcategories?: RuntimeCategory[]
}

interface CategoryTitleProps {
	onClick?: () => void
	title?: string
	icon?: string
	hasSubItems?: boolean
}

function CategoryTitle({ onClick, title, icon }: CategoryTitleProps) {
	return (
		<View
			onClick={onClick}
			className='p-4 flex justify-between items-center bg-white'>
			<View className='flex items-center gap-4'>
				{icon && (
					<Image
						className='max-w-[30px]'
						src={icon}
					/>
				)}
				<Text className='font-bold'>{title}</Text>
			</View>
			<svg
				width='10'
				height='16'
				viewBox='0 0 10 16'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'>
				<path
					d='M1.38892 1.38889L7.63892 7.63889L1.38892 13.8889'
					stroke='#0C0C0C'
					strokeWidth='2.77778'
					strokeLinecap='round'
					strokeLinejoin='round'
				/>
			</svg>
		</View>
	)
}

interface CategoryPageItemProps {
	item: RuntimeCategory
	goToItem: (payload: any) => void
}

function CategoryPageItem({ item, goToItem }: CategoryPageItemProps) {
	const [navigationStack, setNavigationStack] = useState<RuntimeCategory[]>([])

	const hasSubItems = (targetItem?: RuntimeCategory) =>
		!!(targetItem?.subcategories && targetItem.subcategories.length > 0)
	const showSubItems = navigationStack.length > 0
	const currentItem = navigationStack[navigationStack.length - 1] || null

	useEffect(() => {
		if (showSubItems) {
			Eitri.navigation.addBackHandler(() => {
				setNavigationStack(previousStack => {
					if (previousStack.length <= 1) {
						return []
					}
					return previousStack.slice(0, -1)
				})
				return false
			})
		} else {
			Eitri.navigation.clearBackHandlers()
		}

		return () => {
			Eitri.navigation.clearBackHandlers()
		}
	}, [showSubItems])

	const openCategory = (selectedItem: RuntimeCategory) => {
		const categoryNames = navigationStack.map(category => category.title).filter(Boolean) as string[]
		if (categoryNames[categoryNames.length - 1] !== selectedItem.title && selectedItem.title) {
			categoryNames.push(selectedItem.title)
		}

		goToItem({
			...selectedItem,
			action: {
				...selectedItem.action,
				categoryNames
			}
		})
	}

	const handleItemPress = (selectedItem: RuntimeCategory) => {
		if (hasSubItems(selectedItem)) {
			setNavigationStack(previousStack => [...previousStack, selectedItem])
		} else {
			openCategory(selectedItem)
		}
	}

	const handleBack = () => {
		setNavigationStack(previousStack => {
			if (previousStack.length <= 1) {
				return []
			}
			return previousStack.slice(0, -1)
		})
	}

	return (
		<>
			<CategoryTitle
				icon={item.icon}
				title={item.title}
				hasSubItems={hasSubItems(item)}
				onClick={() => handleItemPress(item)}
			/>
			<View
				className={`flex flex-col min-h-screen h-screen w-screen fixed ${
					showSubItems ? 'left-0 ' : 'left-[100vw]'
				} top-0 transition-left duration-300 z-[9999]`}>
				<HeaderContentWrapper
					containerClassName={`${
						showSubItems ? 'left-0' : '!left-[100vw] !shadow-none'
					} transition-left !duration-300 !backdrop-blur-none !bg-white`}>
					<HeaderReturn onClick={handleBack} />
					<HeaderText text={currentItem?.title || item.title}>{currentItem?.title || item.title}</HeaderText>
				</HeaderContentWrapper>
				<View
					bottomInset={'auto'}
					className='bg-white flex-1 overflow-y-auto'>
					<View className='flex flex-col'>
						{currentItem?.subcategories?.map(subItem => (
							<CategoryTitle
								key={subItem.title}
								icon={subItem.icon}
								hasSubItems={hasSubItems(subItem)}
								title={subItem.title}
								onClick={() => handleItemPress(subItem)}
							/>
						))}
					</View>
				</View>
			</View>
		</>
	)
}

export default function CategoryListSwipe({ content = [] }: Props) {
	const openItem = (item: any) => {
		processActions(item)
	}

	return (
		<View className='flex flex-col w-screen max-w-screen overflow-x-hidden bg-white mt-2'>
			<Text className='text-xl font-bold px-4 py-2'>Categorias</Text>
			<View className='flex flex-col w-screen max-w-screen overflow-x-hidden mb-2'>
				{content.map(item => (
					<CategoryPageItem
						key={item.title}
						item={item}
						goToItem={openItem}
					/>
				))}
			</View>
		</View>
	)
}
