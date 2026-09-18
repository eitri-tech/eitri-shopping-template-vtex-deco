import { View, Text, Image } from 'eitri-luminus'
import { processActions } from '../services/ResolveCmsActions'
import type { ComponentType } from 'react'
import type { CmsAction } from './types'
import type { ImageWidget } from '../types/widgets'
import Divisor from '../components/Divisor/Divisor'
import BadgePercentIcon from '../components/BadgePercentIcon/BadgePercentIcon'
import ShoppingBagIcon from '../components/ShoppingBagIcon/ShoppingBagIcon'
import GiftIcon from '../components/GiftIcon/GiftIcon'
import TagIcon from '../components/TagIcon/TagIcon'
import StarIcon from '../components/StarIcon/StarIcon'
import PercentIcon from '../components/PercentIcon/PercentIcon'
import CircleDollarSignIcon from '../components/CircleDollarSignIcon/CircleDollarSignIcon'
import ShoppingCartIcon from '../components/ShoppingCartIcon/ShoppingCartIcon'
import TicketIcon from '../components/TicketIcon/TicketIcon'
import HandHoldingUsdIcon from '../components/HandHoldingUsdIcon/HandHoldingUsdIcon'
import StoreBagIcon from '../components/StoreBagIcon/StoreBagIcon'
import PixIcon from '../components/PixIcon/PixIcon'

const ICON_MAP: Record<string, ComponentType<{ size?: number }>> = {
	LuBadgePercent: BadgePercentIcon,
	LuShoppingBag: ShoppingBagIcon,
	LuGift: GiftIcon,
	LuTag: TagIcon,
	LuStar: StarIcon,
	LuPercent: PercentIcon,
	LuCircleDollarSign: CircleDollarSignIcon,
	LuShoppingCart: ShoppingCartIcon,
	LuTicket: TicketIcon,
	FaHandHoldingUsd: HandHoldingUsdIcon,
	FiShoppingBag: ShoppingBagIcon,
	FiGift: GiftIcon,
	storebag: StoreBagIcon,
	pix: PixIcon
}

export interface ExperienceItem {
	/**
	 * @title Nome do ícone.
	 * @description Um dos nomes mapeados: LuBadgePercent, LuShoppingBag, LuGift, LuTag, LuStar, LuPercent, LuCircleDollarSign, LuShoppingCart, LuTicket, FaHandHoldingUsd, FiShoppingBag, FiGift, storebag, pix.
	 */
	iconName?: string
	/**
	 * @title Ícone (URL).
	 */
	icon?: ImageWidget
	/**
	 * @title Título.
	 */
	title?: string
	/**
	 * @title Descrição.
	 */
	description?: string
	action?: CmsAction
}

export interface Props {
	/**
	 * @title Título da seção.
	 */
	title?: string
	items?: ExperienceItem[]
}

export default function Experiences({ title, items = [] }: Props) {
	const rows: ExperienceItem[][] = []
	for (let i = 0; i < items.length; i += 2) {
		rows.push(items.slice(i, i + 2))
	}

	const renderItem = (item: ExperienceItem, index: number) => {
		const hasAction = item.action?.type && item.action.type !== 'none'
		const Icon = item.iconName ? ICON_MAP[item.iconName] : undefined

		return (
			<View
				key={index}
				className='flex-1 flex flex-col items-center py-5 px-3 gap-2'
				onClick={hasAction ? () => processActions(item) : undefined}>
				{Icon ? (
					<View className='flex items-center justify-center'>
						<Icon size={48} />
					</View>
				) : item.icon ? (
					<Image
						src={item.icon}
						width={48}
						height={48}
						className='object-contain'
					/>
				) : null}
				{item.title ? (
					<Text className='block font-bold text-base text-center leading-tight text-gray-900'>{item.title}</Text>
				) : null}
				{item.description ? (
					<Text className='block text-xs text-center leading-tight text-gray-500 underline'>
						{item.description}
					</Text>
				) : null}
			</View>
		)
	}

	return (
		<View className='flex flex-col gap-3 mt-6 bg-[#E8E6DF] py-6 px-2 mx-4'>
			{title ? (
				<View>
					<Text className='block text-2xl font-bold text-center leading-tight wrap-normal'>{title}</Text>
				</View>
			) : null}
			<View className='flex flex-col'>
				{rows.map((rowItems, rowIndex) => (
					<View key={rowIndex}>
						<View className='flex'>
							{renderItem(rowItems[0], rowIndex * 2)}
							{rowItems[1] && <View className='w-[1px] bg-primary opacity-30' />}
							{rowItems[1] && renderItem(rowItems[1], rowIndex * 2 + 1)}
						</View>
						{rowIndex < rows.length - 1 && (
							<View className='opacity-30'>
								<Divisor />
							</View>
						)}
					</View>
				))}
			</View>
		</View>
	)
}
