// Returns null (not '') for missing properties — callers should guard with !value or ?? default
export const getProductProperty = (product, propertyName) => {
	const prop = product?.properties?.find(p => p.name === propertyName)
	return prop?.values?.[0] || null
}

export const getAgrupadorCode = product => {
	const code = getProductProperty(product, 'Codigo Agrupador')
	if (!code) return null
	const trimmed = String(code).trim()
	// '000000' (e qualquer valor só de zeros) é um placeholder atribuído no catálogo VTEX
	// a produtos SEM agrupamento real (ex.: 241 relógios/itens avulsos compartilham '000000').
	// Tratar como "sem código" evita exibir dezenas de "variações" sem relação (ESS-974).
	if (!trimmed || /^0+$/.test(trimmed)) return null
	return trimmed
}

const DEFAULT_METAL_COLOR = '#C0C0C0'

// Order matters: "Prata com Banho de Ouro Rosé" must resolve to rosé,
// "Ouro Branco" to branco (NOT amarelo — ambos contêm "Ouro"),
// "Prata com Banho de Ouro Amarelo" to amarelo, plain "Prata" to prata.
const METAL_COLORS = [
	{ match: /ros[eé]/i, color: '#E0A487' },
	{ match: /branco/i, color: '#E8E8E8' },
	{ match: /amarelo|ouro/i, color: '#D4AF37' },
	{ match: /prata/i, color: DEFAULT_METAL_COLOR }
]

export const getMetalColor = material => {
	if (!material) return DEFAULT_METAL_COLOR
	const found = METAL_COLORS.find(m => m.match.test(material))
	return found ? found.color : DEFAULT_METAL_COLOR
}

export const groupSiblingsByCode = products => {
	if (!Array.isArray(products)) return {}
	return products.reduce((acc, product) => {
		const code = getAgrupadorCode(product)
		if (!code) return acc
		if (!acc[code]) acc[code] = []
		acc[code].push(product)
		return acc
	}, {})
}
