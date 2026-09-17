import Eitri from 'eitri-bifrost'
import { Vtex } from 'eitri-shopping-vtex-shared'

export const getLoginProviders = async () => {
	return await Vtex.store.getLoginProviders()
}
