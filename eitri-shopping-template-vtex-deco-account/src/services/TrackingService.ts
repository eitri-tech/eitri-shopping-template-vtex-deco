import { TrackingService } from 'eitri-shopping-template-vtex-deco-shared'

export const sendScreenView = async (friendlyScreenName: string, screenFilename: string): Promise<void> => {
	try {
		TrackingService.sendScreenView(friendlyScreenName, screenFilename)
	} catch (e) {
		console.log('Error on TrackingService_old.screenView', e)
	}
}
