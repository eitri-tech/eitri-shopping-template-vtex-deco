import { useEffect, useState } from 'react'
import { View } from 'eitri-luminus'
import { HeaderReturn, HeaderContentWrapper, HeaderText } from 'eitri-shopping-template-vtex-deco-shared'
import Eitri from 'eitri-bifrost'
import CategoryTitle from './CategoryTitle'
import { useTranslation } from 'eitri-i18n'

export interface CategoryNavItem {
	title?: string
	icon?: string
	subcategories?: CategoryNavItem[]
	// Matches ResolveCmsActions.ts's local CmsAction shape structurally (that interface isn't
	// exported) — passed as-is to processActions in the parent CategoryListSwipe.
	action?: {
		type?: string
		value?: string
		sort?: string
		title?: string
		banner?: string
		facets?: Array<{ key: string; value: string }>
		[key: string]: unknown
	}
	mktTag?: string
	[key: string]: unknown
}

interface CategoryPageItemProps {
	item: CategoryNavItem
	goToItem?: (item: CategoryNavItem) => void
}

export default function CategoryPageItem(props: CategoryPageItemProps) {
	const { item, goToItem } = props
	const { t } = useTranslation()

	const [navigationStack, setNavigationStack] = useState<CategoryNavItem[]>([])

	const hasSubItems = (targetItem?: CategoryNavItem) =>
		Boolean(targetItem?.subcategories && targetItem.subcategories.length > 0)
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

	const handleItemPress = (selectedItem: CategoryNavItem) => {
		if (hasSubItems(selectedItem)) {
			setNavigationStack(previousStack => [...previousStack, selectedItem])
		} else {
			goToItem?.(selectedItem)
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
				className={`flex flex-col min-h-screen h-screen w-screen fixed ${showSubItems ? 'left-0 ' : 'left-[100vw]'} top-0 transition-left duration-300 z-[9999]`}>
				<HeaderContentWrapper
					containerClassName={`${showSubItems ? 'left-0' : '!left-[100vw] !shadow-none'} transition-left !duration-300 !backdrop-blur-none !bg-white`}>
					<HeaderReturn onClick={handleBack} />
					<HeaderText text={currentItem?.title || item.title} />
				</HeaderContentWrapper>
				<View
					bottomInset={'auto'}
					className='bg-base-100 flex-1 overflow-y-auto'>
					<View className='flex flex-col p-4 gap-4'>
						{currentItem?.action && (
							<CategoryTitle
								icon={currentItem.icon}
								hasSubItems={false}
								title={t('categoryPage.seeAll', { title: currentItem.title })}
								onClick={() => goToItem?.(currentItem)}
							/>
						)}
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
