import { Vtex } from 'eitri-shopping-vtex-shared'
import Eitri from 'eitri-bifrost'

const limit = 5

export const getTopSearches = async () => {
	return Vtex.catalog.topSearches('pt-BR')
}

export const saveSearchHistory = async (term: string): Promise<void> => {
	const history = ((await Eitri.storage.getItemJson('search-history')) as string[] | undefined) || []

	if (!term) return

	const index = history.indexOf(term)
	if (index !== -1) history.splice(index, 1)

	history.unshift(term)

	if (history.length > limit) history.pop()

	await Eitri.storage.setItemJson('search-history', history)
}

export const getSearchHistory = async (): Promise<string[]> => {
	const history = ((await Eitri.storage.getItemJson('search-history')) as string[] | undefined) || []
	return history.splice(0, limit)
}

export const deleteHistory = async (): Promise<void> => {
	// Eitri.storage.clear(options?: StorageOptions) ignores a raw string and wipes ALL storage
	// keys, not just this one — the real single-key removal API is removeItem(key).
	await Eitri.storage.removeItem('search-history')
}
