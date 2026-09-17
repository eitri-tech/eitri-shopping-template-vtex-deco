import { View, Text, Image } from 'eitri-luminus'
import { useState } from 'react'
import GenericBox from '../components/GenericBox/GenericBox'
import ChevronRightIcon from '../components/ChevronRightIcon/ChevronRightIcon'
import SectionTitle from '../components/SectionTitle/SectionTitle'
import { processActions } from '../services/ResolveCmsActions'
import type { CmsAction } from './types'
import type { ImageWidget } from '../types/widgets'

export interface CategoryAccordionSubItem {
	/**
	 * @title Título.
	 */
	title?: string
	/**
	 * @title Imagem (URL).
	 */
	imageUrl?: ImageWidget
	action?: CmsAction
}

export interface CategoryAccordionItem {
	/**
	 * @title Título.
	 */
	title?: string
	/**
	 * @title Imagem (URL).
	 */
	imageUrl?: ImageWidget
	action?: CmsAction
	subItems?: CategoryAccordionSubItem[]
}

export interface Props {
	/**
	 * @title Título da seção.
	 */
	title?: string
	content?: CategoryAccordionItem[]
}

const handleAction = (item: CategoryAccordionItem | CategoryAccordionSubItem) => {
	processActions(item)
}

interface CategoryItemProps {
	item: CategoryAccordionItem
	isLast: boolean
}

function CategoryItem({ item, isLast }: CategoryItemProps) {
	const hasSubItems = Array.isArray(item.subItems) && item.subItems.length > 0
	const [isOpen, setIsOpen] = useState(false)

	const onRowClick = () => {
		if (hasSubItems) {
			setIsOpen(prev => !prev)
		} else {
			handleAction(item)
		}
	}

	return (
		<View>
			<View
				className={`flex flex-row items-center gap-3 py-3 ${
					!isLast || isOpen ? 'border-b border-neutral-200' : ''
				}`}
				onClick={onRowClick}>
				{item.imageUrl && (
					<View className='w-9 h-9 rounded-full overflow-hidden shrink-0'>
						<Image
							src={item.imageUrl}
							className='w-full h-full object-cover'
						/>
					</View>
				)}

				<Text className='text-sm font-semibold text-gray-800 grow'>{item.title}</Text>

				{hasSubItems && (
					<ChevronRightIcon
						size={18}
						className={`text-gray-400 transition-transform duration-200 shrink-0 ${
							isOpen ? 'rotate-90' : ''
						}`}
					/>
				)}
			</View>

			{isOpen && item.subItems && (
				<View className='flex flex-col pl-4 border-b border-neutral-200'>
					{item.subItems.map((sub, subIndex) => (
						<View
							key={subIndex}
							className='flex flex-row items-center gap-3 py-3 border-b border-neutral-100 last:border-0'
							onClick={() => handleAction(sub)}>
							{sub.imageUrl && (
								<View className='w-8 h-8 rounded-full overflow-hidden shrink-0'>
									<Image
										src={sub.imageUrl}
										className='w-full h-full object-cover'
									/>
								</View>
							)}
							<Text className='text-sm text-gray-600 grow'>{sub.title}</Text>
							{sub.action?.type !== 'none' && (
								<ChevronRightIcon
									size={14}
									className='text-neutral-300 shrink-0'
								/>
							)}
						</View>
					))}
				</View>
			)}
		</View>
	)
}

export default function CategoryAccordion({ title, content }: Props) {
	if (!content?.length) return null

	return (
		<View>
			<SectionTitle title={title} />
			<View className={'px-4'}>
				<GenericBox className='px-4'>
					<View className='flex flex-col'>
						{content.map((item, index) => (
							<CategoryItem
								key={index}
								item={item}
								isLast={index === content.length - 1}
							/>
						))}
					</View>
				</GenericBox>
			</View>
		</View>
	)
}
