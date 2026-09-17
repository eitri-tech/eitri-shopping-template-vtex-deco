import { TrackingService } from 'eitri-shopping-template-vtex-deco-shared'

export const sendScreenView = async (friendlyScreenName, screenFilename) => {
	try {
		TrackingService.sendScreenView(friendlyScreenName, screenFilename)
	} catch (e) {
		console.log('Error on TrackingService_old.screenView', e)
	}
}
