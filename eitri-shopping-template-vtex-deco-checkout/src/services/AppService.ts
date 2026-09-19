import Eitri from 'eitri-bifrost'
import { App } from 'eitri-shopping-vtex-shared'

export const startConfigure = async (): Promise<void> => {
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

export const autoTriggerGAEvents = (): boolean => {
	// eitri-shopping-vtex-shared's own .d.ts only declares { verbose, gaVerbose } for App.configs,
	// tighter than its real runtime shape (which carries the merged appConfigs too).
	const configs = App?.configs as { appConfigs?: { autoTriggerGAEvents?: boolean } } | undefined
	return configs?.appConfigs?.autoTriggerGAEvents ?? true
}
