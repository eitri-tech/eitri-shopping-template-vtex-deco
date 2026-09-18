import { View, Text, Image } from 'eitri-luminus'
import { useCallback, useEffect, useRef, useState } from 'react'
import { RemoteConfig } from 'eitri-shopping-vtex-shared'
import { processActions } from '../services/ResolveCmsActions'
import type { CmsAction } from './types'
import type { ImageWidget } from '../types/widgets'

export interface CategoryItem {
	/**
	 * @title Título.
	 */
	title?: string
	/**
	 * @title Imagem.
	 */
	imageUrl?: ImageWidget
	action?: CmsAction
}

export interface CategoryTab {
	/**
	 * @title Rótulo da aba.
	 */
	label: string
	categories: CategoryItem[]
}

export type CategoryGalleryMode = 'Vertical' | 'Horizontal'

export interface Props {
	/**
	 * @title Título da seção.
	 */
	title?: string
	/**
	 * @title Modo de exibição.
	 * @description Vertical exibe uma grade de 2 colunas; Horizontal exibe um carrossel com paginação.
	 */
	mode?: CategoryGalleryMode
	/**
	 * @title Aspect Ratio da imagem (4:3).
	 * @description Formato largura:altura. Ex: 4:3, 1:1, 16:9. Se vazio, usa o padrão do modo.
	 */
	aspectRatio?: string
	tabs?: CategoryTab[]
}

interface GalleryProps {
	categories: CategoryItem[]
	contentVisible: boolean
	onClick: (category: CategoryItem) => void
	aspectRatio?: string
}

function VerticalGallery({ categories, contentVisible, onClick, aspectRatio }: GalleryProps) {
	const containerStyle = aspectRatio ? { aspectRatio: aspectRatio.replace(':', '/') } : undefined

	return (
		<View
			className={`flex flex-wrap transition-opacity duration-150 ${
				contentVisible ? 'opacity-100' : 'opacity-0'
			}`}>
			{categories.map((category, index) => (
				<View
					key={index}
					className='w-1/2 flex flex-col items-center pb-4 px-1'
					onClick={() => onClick(category)}>
					<View className={`w-full ${aspectRatio ? '' : 'h-[270px]'} bg-gray-100 overflow-hidden`} style={containerStyle}>
						{category.imageUrl ? (
							<Image
								src={category.imageUrl}
								className='w-full h-full object-cover'
							/>
						) : null}
					</View>
					{category.title ? (
						<Text className='text-sm text-center text-gray-900 mt-2'>{category.title}</Text>
					) : null}
				</View>
			))}
		</View>
	)
}

function HorizontalGallery({ categories, contentVisible, onClick, aspectRatio }: GalleryProps) {
	const scrollRef = useRef<any>(null)
	const [showIndicator, setShowIndicator] = useState(false)
	const [thumb, setThumb] = useState({ ratio: 1, offset: 0 })

	// O `ref` num <View> (class component do luminus) aponta para a instância,
	// não para o <div>. Use getViewElement() para obter o elemento DOM real.
	const getScrollEl = () => {
		const view: any = scrollRef.current
		if (!view) return null
		return typeof view.getViewElement === 'function' ? view.getViewElement() : view
	}

	const measure = useCallback(() => {
		const el = getScrollEl()
		if (!el) return
		const overflow = el.scrollWidth > el.clientWidth + 1
		setShowIndicator(overflow)
		if (overflow) {
			setThumb({ ratio: el.clientWidth / el.scrollWidth, offset: 0 })
		}
	}, [])

	useEffect(() => {
		const el = getScrollEl()
		if (el) el.scrollLeft = 0
		measure()
		// re-mede após o layout/imagens assentarem
		const raf = requestAnimationFrame(measure)
		window.addEventListener('resize', measure)
		return () => {
			cancelAnimationFrame(raf)
			window.removeEventListener('resize', measure)
		}
	}, [categories, measure])

	const handleScroll = useCallback(
		(event: any) => {
			const element = event.currentTarget
			const maxScroll = element.scrollWidth - element.clientWidth
			if (maxScroll <= 0) return

			const ratioPct = thumb.ratio * 100
			const offset = (element.scrollLeft / maxScroll) * (100 - ratioPct)
			setThumb(prev => ({ ...prev, offset }))
		},
		[thumb.ratio]
	)

	return (
		<View
			className={`flex flex-col -mx-4 transition-opacity duration-150 ${
				contentVisible ? 'opacity-100' : 'opacity-0'
			}`}>
			<View
				ref={scrollRef}
				onScroll={handleScroll}
				className='flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
				<View className='flex gap-2 px-4'>
					{categories.map((category, index) => (
						<View
							key={index}
							className='w-[40vw] min-w-[40vw] flex flex-col items-center'
							onClick={() => onClick(category)}>
							<View
								className={`w-full ${aspectRatio ? '' : 'aspect-[3/4]'} bg-gray-100 overflow-hidden`}
								style={aspectRatio ? { aspectRatio: aspectRatio.replace(':', '/') } : undefined}>
								{category.imageUrl ? (
									<Image
										src={category.imageUrl}
										className='w-full h-full object-cover'
									/>
								) : null}
							</View>
							{category.title ? (
								<Text className='text-sm text-center text-gray-900 mt-1'>{category.title}</Text>
							) : null}
						</View>
					))}
				</View>
			</View>

			{showIndicator && (
				<View className='flex justify-center mt-3'>
					<View className='flex w-2/5 h-[3px] rounded-full bg-[#D9D5C9] overflow-hidden'>
						<View width={`${thumb.offset}%`} />
						<View width={`${thumb.ratio * 100}%`} className='h-full rounded-full bg-black' />
					</View>
				</View>
			)}
		</View>
	)
}

export default function CategoryGallery({ title, mode = 'Vertical', aspectRatio, tabs = [] }: Props) {
	const centerTitleAndTabs =
		RemoteConfig.getContent('appConfigs.home.categoryGallery.centerTitleAndTabs') === true
	const [activeTabIndex, setActiveTabIndex] = useState(0)
	const [contentVisible, setContentVisible] = useState(true)

	const activeTab = tabs[activeTabIndex]
	const categories = activeTab?.categories || []

	const handleTabChange = (index: number) => {
		if (index === activeTabIndex) return
		setContentVisible(false)
		setTimeout(() => {
			setActiveTabIndex(index)
			setContentVisible(true)
		}, 150)
	}

	return (
		<View className='flex flex-col gap-4 px-4 pt-2'>
			{title ? (
				<Text className={`text-2xl font-bold text-gray-900 ${centerTitleAndTabs ? 'text-center' : ''}`}>
					{title}
				</Text>
			) : null}
			{tabs.length > 0 ? (
				<View className={`flex flex-row gap-2 ${centerTitleAndTabs ? 'justify-center' : ''}`}>
					{tabs.map((tab, index) => {
						const isActive = index === activeTabIndex
						return (
							<View
								key={index}
								className={`px-4 py-2 border border-gray-900 rounded-full transition-colors duration-200 ${
									isActive ? 'bg-gray-900' : 'bg-white'
								}`}
								onClick={() => handleTabChange(index)}>
								<Text
									className={`text-sm font-medium transition-colors duration-200 ${
										isActive ? 'text-white' : 'text-gray-900'
									}`}>
									{tab.label}
								</Text>
							</View>
						)
					})}
				</View>
			) : null}
			{mode === 'Horizontal' ? (
				<HorizontalGallery
					categories={categories}
					contentVisible={contentVisible}
					onClick={processActions}
					aspectRatio={aspectRatio}
				/>
			) : (
				<VerticalGallery
					categories={categories}
					contentVisible={contentVisible}
					onClick={processActions}
					aspectRatio={aspectRatio}
				/>
			)}
		</View>
	)
}
