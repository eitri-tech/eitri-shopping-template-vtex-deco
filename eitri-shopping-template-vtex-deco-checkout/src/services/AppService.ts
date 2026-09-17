import Eitri from 'eitri-bifrost'
import { App } from 'eitri-shopping-vtex-shared'

export const startConfigure = async () => {
	await App.tryAutoConfigure({
		// providerInfo: {
		// 	account: 'eitripartnerbr',
		// 	host: 'https://www.eitripartnerbr.com.br',
		// 	faststore: 'polishop-eitri-app',
		// 	domain: 'https://www.eitripartnerbr.com.br',
		// 	vtexCmsUrl: 'https://eitripartnerbr.myvtex.com/'
		// },
		verbose: false,
		gaVerbose: false
	})
}

export const autoTriggerGAEvents = () => {
	return App?.configs?.appConfigs?.autoTriggerGAEvents ?? true
}
