import { TrackingService } from 'eitri-shopping-monte-carlo-shared'

export const sendScreenView = async (friendlyScreenName, screenFilename) => {
	try {
		TrackingService.sendScreenView(friendlyScreenName, screenFilename)
	} catch (e) {
		console.log('Error on TrackingService_old.screenView', e)
	}
}
