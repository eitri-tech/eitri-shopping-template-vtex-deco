import { Vtex } from 'eitri-shopping-vtex-shared'
import Eitri from 'eitri-bifrost'

// const MAX_HISTORY_LENGTH = 8;
const limit = 5

export const getTopSearches = async () => {
	return Vtex.catalog.topSearches()
}

export const saveSearchHistory = async term => {
	const history = (await Eitri.storage.getItemJson('search-history')) || []

	if (!term) return

	const index = history.indexOf(term)
	if (index !== -1) history.splice(index, 1) // remove if already exists

	history.unshift(term) // add to the beginning

	if (history.length > limit) history.pop() // remove the oldest (end)

	await Eitri.storage.setItemJson('search-history', history)
}

export const getSearchHistory = async () => {
	const history = (await Eitri.storage.getItemJson('search-history')) || []
	return history.splice(0, limit)
}

export const deleteHistory = async () => {
	await Eitri.storage.clear('search-history')
}
