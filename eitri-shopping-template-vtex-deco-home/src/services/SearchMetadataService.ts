import { Vtex } from 'eitri-shopping-vtex-shared'
import Eitri from 'eitri-bifrost'

// const MAX_HISTORY_LENGTH = 8;
const limit = 5

export const getTopSearches = async () => {
	return Vtex.catalog.topSearches('pt-BR')
}

export const saveSearchHistory = async (term?: string): Promise<void> => {
	const history = ((await Eitri.storage.getItemJson('search-history')) as string[]) || []

	if (!term) return

	const index = history.indexOf(term)
	if (index !== -1) history.splice(index, 1) // remove if already exists

	history.unshift(term) // add to the beginning

	if (history.length > limit) history.pop() // remove the oldest (end)

	await Eitri.storage.setItemJson('search-history', history)
}

export const getSearchHistory = async (): Promise<string[]> => {
	const history = ((await Eitri.storage.getItemJson('search-history')) as string[]) || []
	return history.splice(0, limit)
}

export const deleteHistory = async (): Promise<void> => {
	// Eitri.storage.clear() takes an options object and wipes the ENTIRE app storage — passing
	// a key string here (as the old code did) had no per-key meaning and risked clearing more
	// than just the search history. removeItem(key) is the correct call for a single key.
	await Eitri.storage.removeItem('search-history')
}
