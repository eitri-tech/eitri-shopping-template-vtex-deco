import { App } from 'eitri-shopping-vtex-shared'

export const startConfigure = async (): Promise<void> => {
	await App.tryAutoConfigure({ verbose: false, gaVerbose: false })
}
