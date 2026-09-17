import Eitri from 'eitri-bifrost'
import { Vtex } from 'eitri-shopping-vtex-shared'

const PUBLISHER_ID = '72c5a3e2-853e-449d-afda-fa41d8eb2bec' //EitriPartner
const BASE_URL = 'https://newtail-media.newtail.com.br/v1/rma'
const SESSION_ID = crypto.randomUUID()

interface SponsoredBannerParams {
	sponsoredPlacement: string
	keyword?: string
	size?: unknown
	context?: unknown
	quantity?: number
}

interface SponsoredAd {
	adId: string
	imageUrl: string
	destinationUrl: string
	clickUrl: string
	impressionUrl: string
	viewUrl: string
}

const getUserId = async (): Promise<string> => {
	try {
		const isLogged = await Vtex.customer.isLoggedIn()
		if (!isLogged) return ''
		// Vtex.customer.getCustomerProfile's `_token` param is typed required (its underscore
		// prefix suggests it's actually unused internally) — the existing call never passed one.
		const profile = await Vtex.customer.getCustomerProfile(undefined)
		return profile?.data?.profile?.userProfileId ?? ''
	} catch {
		return ''
	}
}

export const getSponsoredBanner = async ({
	sponsoredPlacement,
	keyword,
	size,
	context,
	quantity
}: SponsoredBannerParams): Promise<SponsoredAd[] | null> => {
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

	// HttpConfig expects headers nested under `headers` — passing them flat here silently
	// dropped the Content-Type header (same bug fixed in shared/src/services/Datadog.ts).
	const res = await Eitri.http.post(`${BASE_URL}/${PUBLISHER_ID}`, body, {
		headers: {
			'Content-Type': 'application/json'
		}
	})

	const ads = (res?.data as Record<string, any[]> | undefined)?.[sponsoredPlacement]
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
