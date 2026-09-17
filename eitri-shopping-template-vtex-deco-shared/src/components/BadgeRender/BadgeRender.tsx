import { Image, Text, View } from 'eitri-luminus'
import type { VtexBadge } from '../../types/vtex'

interface BadgeRenderProps {
	badges?: VtexBadge[]
	className?: string
	imageClassName?: string
	[key: string]: unknown
}

export default function BadgeRender(props: BadgeRenderProps) {
	const { badges, className, imageClassName = 'w-[40px]' } = props

	if (!badges || badges.length === 0) return null

	return (
		<View className={className}>
			{badges?.map((badge, index) => (
				<View key={badge.image ?? badge.textBadge?.text ?? index}>
					{badge.image && (
						<Image
							src={badge.image}
							className={`mix-blend-normal opacity-100 ${imageClassName || ''}`}
						/>
					)}
					{!badge.image && badge?.textBadge?.text && (
						<View
							style={{
								backgroundColor: badge?.textBadge?.bgColor,
								color: badge?.textBadge?.textColor
							}}
							className='text-xs font-bold text-white bg-primary rounded px-2 py-1'>
							<Text>{badge?.textBadge?.text}</Text>
						</View>
					)}
				</View>
			))}
		</View>
	)
}
