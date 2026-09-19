import { View, Text } from 'eitri-luminus'
import { useState } from 'react'
import { processActions } from '../../../services/ResolveCmsActions'
import VerticalGallery from './components/VerticalGallery'
import HorizontalGallery from './components/HorizontalGallery'
import { RemoteConfig } from 'eitri-shopping-vtex-shared'

interface Category {
	title?: string
	imageUrl?: string
	[key: string]: unknown
}

interface Tab {
	label?: string
	categories?: Category[]
	[key: string]: unknown
}

interface CategoryGalleryData {
	title?: string
	tabs?: Tab[]
	mode?: string
	aspectRatio?: string
}

interface CategoryGalleryProps {
	data?: CategoryGalleryData
}

export default function CategoryGallery(props: CategoryGalleryProps) {
	const { data } = props
	const title = data?.title
	const tabs = data?.tabs || []
	const mode = data?.mode || 'Vertical'
	const aspectRatio = data?.aspectRatio || ''
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
				<Text
					className={`text-2xl font-bold text-gray-900 ${centerTitleAndTabs ? 'text-center' : ''}`}>
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
								className={`px-5 py-2 rounded-full border border-gray-900 transition-colors duration-200 ${isActive ? 'bg-gray-900' : 'bg-white'}`}
								onClick={() => handleTabChange(index)}>
								<Text className={`text-sm font-medium transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-900'}`}>
									{tab.label}
								</Text>
							</View>
						)
					})}
				</View>
			) : null}
			{(() => {
				switch (mode) {
					case 'Horizontal':
						return (
							<HorizontalGallery
								categories={categories}
								contentVisible={contentVisible}
								onClick={processActions}
								aspectRatio={aspectRatio}
							/>
						)
					case 'Vertical':
					default:
						return (
							<VerticalGallery
								categories={categories}
								contentVisible={contentVisible}
								onClick={processActions}
								aspectRatio={aspectRatio}
							/>
						)
				}
			})()}
		</View>
	)
}
