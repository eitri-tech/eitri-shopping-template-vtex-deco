import Eitri from 'eitri-bifrost'
import { Vtex } from 'eitri-shopping-vtex-shared'

const PUBLISHER_ID = '72c5a3e2-853e-449d-afda-fa41d8eb2bec' //EitriPartner
const BASE_URL = 'https://newtail-media.newtail.com.br/v1/rma'
const SESSION_ID = crypto.randomUUID()

const getUserId = async () => {
	try {
		const isLogged = await Vtex.customer.isLoggedIn()
		if (!isLogged) return ''
		const profile = await Vtex.customer.getCustomerProfile()
		return profile?.data?.profile?.userProfileId ?? ''
	} catch {
		return ''
	}
}

export const getSponsoredBanner = async ({ sponsoredPlacement, keyword, size, context, quantity }) => {
	const body = {
		term: keyword ?? '',
		context,
		placements: {
			[sponsoredPlacement]: {
				quantity: quantity || 1,
				types: ['banner'],
				size
			}
		},
		user_id: SESSION_ID,
		session_id: SESSION_ID,
		channel: 'app'
	}

	const res = await Eitri.http.post(`${BASE_URL}/${PUBLISHER_ID}`, body, {
		'Content-Type': 'application/json'
	})

	const ads = res?.data?.[sponsoredPlacement]
	if (!ads?.length) return null

	return ads.map(ad => ({
		adId: ad.ad_id,
		imageUrl: ad.media_url,
		destinationUrl: ad.destination_url,
		clickUrl: ad.click_url,
		impressionUrl: ad.impression_url,
		viewUrl: ad.view_url
	}))
}
