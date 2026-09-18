import { View, Text, Image } from 'eitri-luminus'
import { useTranslation } from 'eitri-i18n'
import { getProductProperty, getMaterialImage, getPedraImage } from 'eitri-shopping-template-vtex-deco-shared'

const PEDRA_PROP = 'Pedra Principal'

const getSwatchImage = product => product?.items?.[0]?.images?.[0]?.imageUrl || ''

// Agrupa os irmãos por `groupProp` (ex.: 'Material'), com 1 opção por valor distinto.
// Como cada combinação Material×Pedra é um produto separado, escolhemos como
// representante de cada opção o irmão que casa com a seleção atual na OUTRA
// dimensão (`matchProp`) — assim clicar em "Ouro Branco" mantém a pedra atual.
// `resolveImage(value, sibling)` define o thumbnail exibido (imagem curada da variação).
function buildOptions(siblings, groupProp, matchProp, currentMatchValue, resolveImage) {
	const byValue = new Map()
	siblings.forEach(sibling => {
		const value = getProductProperty(sibling, groupProp)
		if (!value) return
		const matchesCurrent = getProductProperty(sibling, matchProp) === currentMatchValue
		if (!byValue.has(value) || matchesCurrent) {
			byValue.set(value, { value, product: sibling, image: resolveImage(value, sibling) })
		}
	})
	return Array.from(byValue.values())
}

function SwatchRow({ label, options, currentValue, onSelect }) {
	if (options.length < 2) return null

	return (
		<View className='flex flex-col gap-2'>
			<Text className='text-sm font-bold text-neutral-700'>{label}</Text>
			<View className='flex flex-row gap-2 flex-wrap'>
				{options.map(option => {
					const isCurrent = option.value === currentValue
					return (
						<View
							key={option.value}
							onClick={e => {
								e.stopPropagation()
								if (!isCurrent && onSelect) onSelect(option.product)
							}}
							className={`w-11 h-10 rounded overflow-hidden flex items-center justify-center border-2 ${
								isCurrent ? 'border-primary' : 'border-neutral-200'
							}`}>
							{option.image ? (
								<Image
									src={option.image}
									className='object-cover w-full h-full'
								/>
							) : (
								<View className='w-full h-full bg-neutral-100' />
							)}
						</View>
					)
				})}
			</View>
		</View>
	)
}

export default function MaterialSwatches({ currentProductId, currentProduct, siblings, onSwatchPress }) {
	const { t } = useTranslation()

	if (!Array.isArray(siblings) || siblings.length < 2) {
		return null
	}

	// O produto atual costuma estar entre os irmãos; usamos o prop explícito quando disponível
	// (ex.: produto indisponível pode não voltar na busca de irmãos com hideUnavailableItems).
	const current = currentProduct || siblings.find(sibling => sibling.productId === currentProductId)
	const currentMaterial = getProductProperty(current, 'Material')
	const currentPedra = getProductProperty(current, PEDRA_PROP)

	const materialOptions = buildOptions(siblings, 'Material', PEDRA_PROP, currentPedra, value =>
		getMaterialImage(value)
	)
	const pedraOptions = buildOptions(siblings, PEDRA_PROP, 'Material', currentMaterial, (value, sibling) =>
		getPedraImage(value) || getSwatchImage(sibling)
	)

	if (materialOptions.length < 2 && pedraOptions.length < 2) {
		return null
	}

	return (
		<View className='flex flex-col gap-4'>
			<SwatchRow
				label={t('materialSwatches.label')}
				options={materialOptions}
				currentValue={currentMaterial}
				onSelect={onSwatchPress}
			/>
			<SwatchRow
				label={t('materialSwatches.pedrasLabel')}
				options={pedraOptions}
				currentValue={currentPedra}
				onSelect={onSwatchPress}
			/>
		</View>
	)
}
