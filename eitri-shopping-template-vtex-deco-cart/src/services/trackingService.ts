import { Tracking } from 'eitri-shopping-vtex-shared'

export const sendPageView = async (pageName: string): Promise<void> => {
	try {
		Tracking.ga.logScreenView(pageName)
	} catch (e) {
		console.error('Erro ao enviar pageView', e)
	}
}
