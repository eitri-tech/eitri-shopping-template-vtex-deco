import Eitri from 'eitri-bifrost'

/**
 * Newsletter subscription flow.
 *
 *   1. GET   {MID}/_v/newsletter?email=...        -> existence check (404 = new lead)
 *   2. POST  {RCK}/_v/register-leads-mkt-cloud    -> forwards the lead to Marketing Cloud (201)
 *   3. PATCH {MID}/_v/newsletter                  -> writes into VTEX newsletter master-data (204)
 *
 * Payload shapes:
 *   2. { name, email, termsAndConditions, creation_date: 'YYYY-MM-DD', page }
 *   3. { email, firstName, termsofuse }   (note: method is PATCH, not POST)
 */

// TODO: replace with your VTEX account name
const ACCOUNT = 'YOUR_VTEX_ACCOUNT'
const MID_BASE = `https://mid--${ACCOUNT}.myvtex.com`
const RCK_BASE = `https://rckmiddleware--${ACCOUNT}.myvtex.com`

const DEFAULT_PAGE = 'lead_newsletter_footer'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

const getStatus = res => res?.status ?? res?.statusCode

const today = () => new Date().toISOString().slice(0, 10) // YYYY-MM-DD

const buildLeadPayload = ({ name, email, acceptedTerms, page }) => ({
	name,
	email,
	termsAndConditions: !!acceptedTerms,
	creation_date: today(),
	page: page || DEFAULT_PAGE
})

const buildNewsletterPayload = ({ name, email }) => ({
	email,
	firstName: name,
	termsofuse: true
})

/**
 * Checks whether an email is already registered in the newsletter list.
 * The live endpoint returns 404 for a new (unregistered) email, so a rejection
 * or a non-2xx status is treated as "not subscribed" rather than a hard error.
 *
 * @returns {Promise<boolean>} true if already subscribed, false otherwise.
 */
export const isEmailSubscribed = async email => {
	try {
		const res = await Eitri.http.get(`${MID_BASE}/_v/newsletter?email=${encodeURIComponent(email)}`, JSON_HEADERS)
		const status = getStatus(res)
		return status >= 200 && status < 300
	} catch (e) {
		// 404 (or network rejection) -> treat as not subscribed
		return false
	}
}

/**
 * Subscribes a lead to the newsletter (Marketing Cloud + VTEX master-data).
 *
 * @param {{ name: string, email: string, acceptedTerms: boolean, page?: string }} lead
 * @returns {Promise<{ success: boolean, alreadySubscribed: boolean }>}
 */
export const subscribeToNewsletter = async ({ name, email, acceptedTerms, page }) => {
	if (!email || !name || !acceptedTerms) {
		throw new Error('subscribeToNewsletter: name, email and acceptedTerms are required')
	}

	const alreadySubscribed = await isEmailSubscribed(email)
	if (alreadySubscribed) {
		return { success: true, alreadySubscribed: true }
	}

	// 2. Register lead into Marketing Cloud middleware (expects 201)
	await Eitri.http.post(
		`${RCK_BASE}/_v/register-leads-mkt-cloud`,
		buildLeadPayload({ name, email, acceptedTerms, page }),
		JSON_HEADERS
	)

	// 3. Register into VTEX newsletter master-data list via PATCH (expects 204)
	await Eitri.http.patch(`${MID_BASE}/_v/newsletter`, buildNewsletterPayload({ name, email }), JSON_HEADERS)

	return { success: true, alreadySubscribed: false }
}

export default { subscribeToNewsletter, isEmailSubscribed }
