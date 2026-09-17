import Eitri from 'eitri-bifrost'
import { Vtex } from 'eitri-shopping-vtex-shared'

export const getLoginProviders = async () => {
	const res =  await Vtex.store.getLoginProviders()
	return res
}
