// TODO: Populate the maps below with your store's own variation swatch image URLs.
// Each map is keyed by the VTEX property value (e.g. "Ouro Amarelo", "Diamante")
// and the value is a CDN URL pointing to the swatch image.
// The lookup is accent- and case-insensitive (see `normalize`).

const MATERIAL_IMAGES: Record<string, string> = {
	// Example:
	// 'Ouro Amarelo': 'https://your-cdn.com/path/to/ouro-amarelo.webp',
	// 'Prata': 'https://your-cdn.com/path/to/prata.webp',
}

const PEDRA_IMAGES: Record<string, string> = {
	// Example:
	// 'Diamante': 'https://your-cdn.com/path/to/diamante.jpg',
	// 'Esmeralda': 'https://your-cdn.com/path/to/esmeralda.png',
}

const DEFAULT_MATERIAL_IMAGE: string | null = MATERIAL_IMAGES['Prata'] || null

// lowercase + trim + collapse spaces + strip accents → tolerant to typing variations
const normalize = (value?: string | null): string =>
	String(value ?? '')
		.trim()
		.replace(/\s+/g, ' ')
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')

const buildLookup = (map: Record<string, string>): Record<string, string> =>
	Object.keys(map).reduce<Record<string, string>>((acc, name) => {
		acc[normalize(name)] = map[name]
		return acc
	}, {})

const MATERIAL_LOOKUP = buildLookup(MATERIAL_IMAGES)
const PEDRA_LOOKUP = buildLookup(PEDRA_IMAGES)

// Material image. No match → default (or empty string if default not set).
export const getMaterialImage = (name?: string | null): string =>
	(MATERIAL_LOOKUP[normalize(name)] || DEFAULT_MATERIAL_IMAGE || '') as string

// Stone image. No match → null (caller decides the fallback).
export const getPedraImage = (name?: string | null): string | null => PEDRA_LOOKUP[normalize(name)] || null

// Unified helper by variation type ('Material' | 'Pedra').
export const getVariationImage = (variationType: string, name?: string | null): string | null =>
	variationType === 'Pedra' ? getPedraImage(name) : getMaterialImage(name)
