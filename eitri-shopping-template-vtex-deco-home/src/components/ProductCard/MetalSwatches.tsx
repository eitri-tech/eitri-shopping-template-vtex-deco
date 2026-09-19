import type { MouseEvent } from 'react'
import { View, Text, Image } from 'eitri-luminus'
import { getProductProperty, getMaterialImage } from 'eitri-shopping-template-vtex-deco-shared'
import type { VtexProduct } from '../../types/vtex'

const MAX_VISIBLE = 2

// Selected material is conveyed purely by position (leftmost), not by a border,
// so the current product's material must be moved to the front of the list.
function getOrderedMaterialOptions(siblings: VtexProduct[], currentProductId?: string): VtexProduct[] {
	const byMaterial = new Map<string, VtexProduct>()
	siblings.forEach(sibling => {
		const material = getProductProperty(sibling, 'Material')
		if (!material) return
		const isCurrent = sibling.productId === currentProductId
		if (!byMaterial.has(material) || isCurrent) {
			byMaterial.set(material, sibling)
		}
	})
	const options = Array.from(byMaterial.values())
	const currentIndex = options.findIndex(option => option.productId === currentProductId)
	if (currentIndex > 0) {
		const [current] = options.splice(currentIndex, 1)
		options.unshift(current)
	}
	return options
}

interface MetalSwatchesProps {
	currentProductId?: string
	siblings?: VtexProduct[]
	onSwatchPress?: (product: VtexProduct) => void
}

export default function MetalSwatches(props: MetalSwatchesProps) {
	const { currentProductId, siblings, onSwatchPress } = props

	if (!Array.isArray(siblings) || siblings.length < 2) {
		return null
	}

	const options = getOrderedMaterialOptions(siblings, currentProductId)

	if (options.length < 2) {
		return null
	}

	const visible = options.slice(0, MAX_VISIBLE)
	const overflow = options.length - MAX_VISIBLE

	return (
		<View className='flex flex-row gap-1.5 mt-1 items-center'>
			{visible.map(sibling => {
				const isCurrent = sibling.productId === currentProductId
				const material = getProductProperty(sibling, 'Material')
				return (
					<View
						key={sibling.productId}
						onClick={(e?: MouseEvent<HTMLElement>) => {
							e?.stopPropagation()
							if (!isCurrent && onSwatchPress) onSwatchPress(sibling)
						}}
						className='w-4 h-4 rounded-sm overflow-hidden border border-neutral-300'>
						<Image
							src={getMaterialImage(material)}
							className='w-full h-full object-cover'
						/>
					</View>
				)
			})}
			{overflow > 0 && (
				<Text className='text-xs text-neutral-500 font-medium'>+{overflow}</Text>
			)}
		</View>
	)
}
