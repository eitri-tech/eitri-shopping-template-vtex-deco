import type { ComponentType } from 'react'
import { View, Text, Image } from 'eitri-luminus'
import { processActions } from '../../../services/ResolveCmsActions'
import {
    BadgePercentIcon,
    ShoppingBagIcon,
    GiftIcon,
    TagIcon,
    StarIcon,
    PercentIcon,
    CircleDollarSignIcon,
    ShoppingCartIcon,
    TicketIcon,
    HandHoldingUsdIcon,
    StoreBagIcon,
    PixIcon,
    Divisor
} from 'eitri-shopping-template-vtex-deco-shared'

const ICON_MAP: Record<string, ComponentType<{ size?: number | string; className?: string }>> = {
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

interface ExperienceAction {
    type?: string
    [key: string]: unknown
}

interface ExperienceItem {
    iconName?: string
    icon?: string
    title?: string
    description?: string
    action?: ExperienceAction
    [key: string]: unknown
}

interface ExperiencesData {
    title?: string
    items?: ExperienceItem[]
}

interface ExperiencesProps {
    data?: ExperiencesData
}

export default function Experiences(props: ExperiencesProps) {
    const { data } = props
    const title = data?.title
    const items = data?.items || []

    const rows: ExperienceItem[][] = []
    for (let i = 0; i < items.length; i += 2) {
        rows.push(items.slice(i, i + 2))
    }

    const renderItem = (item: ExperienceItem, index: number) => {
        const hasAction = Boolean(item.action?.type && item.action.type !== 'none')

        return (
            <View
                key={index}
                className="flex-1 flex flex-col items-center py-5 px-3 gap-2"
                onClick={hasAction ? () => processActions(item) : undefined}
            >
                {item.iconName && ICON_MAP[item.iconName] ? (
                    <View className="flex items-center justify-center">
                        {(() => {
                            const Icon = ICON_MAP[item.iconName]
                            return <Icon size={48} />
                        })()}
                    </View>
                ) : item.icon ? (
                    <Image
                        src={item.icon}
                        width={48}
                        height={48}
                        className="object-contain"
                    />
                ) : null}
                {item.title ? (
                    <Text className="block font-bold text-base text-center leading-tight text-gray-900">
                        {item.title}
                    </Text>
                ) : null}
                {item.description ? (
                    <Text className="block text-xs text-center leading-tight text-gray-500 underline">
                        {item.description}
                    </Text>
                ) : null}
            </View>
        )
    }

    return (
        <View className="flex flex-col gap-3 mt-6 bg-[#E8E6DF] py-6 px-2 mx-4">
            {title ? (
                <View>
                    <Text className="block text-2xl font-bold text-center leading-tight wrap-normal">{title}</Text>
                </View>
            ) : null}
            <View className="flex flex-col">
                {rows.map((rowItems, rowIndex) => (
                    <View key={rowIndex}>
                        <View className="flex">
                            {renderItem(rowItems[0], rowIndex * 2)}
                            {rowItems[1] && <View className="w-[1px] bg-primary opacity-30" />}
                            {rowItems[1] && renderItem(rowItems[1], rowIndex * 2 + 1)}
                        </View>
                        {rowIndex < rows.length - 1 && (
                            <View className="opacity-30">
                                <Divisor />
                            </View>
                        )}
                    </View>
                ))}
            </View>
        </View>
    )
}
