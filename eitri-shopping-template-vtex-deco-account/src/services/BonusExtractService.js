import Eitri from 'eitri-bifrost'
import { Vtex } from 'eitri-shopping-vtex-shared'
import { Datadog, TrackingService } from 'eitri-shopping-monte-carlo-shared'

/**
 * Real "Meu Bônus" extract (wallets / orders / incentives) — Monte Carlo's own
 * gateway, per "Especificação Técnica de Integração" (v1.0, 10/08/2026).
 *
 * The app forwards the shopper's own live VTEX session token (obtained via
 * `Vtex.customer.getCustomerToken`) plus their CPF; the gateway validates the
 * token against VTEX ID itself and cross-checks it belongs to that CPF (403 on
 * mismatch). No separate API secret is shipped in the app bundle.
 */

const GATEWAY_URL = 'https://gw-node-49.montecarlo.com.br/v1/app/fetch'
const JSON_HEADERS = { 'Content-Type': 'application/json' }
const REQUEST_TIMEOUT_MS = 15000

export const BONUS_API_ERROR = {
	BAD_REQUEST: 'bad_request',
	UNAUTHORIZED: 'unauthorized',
	FORBIDDEN: 'forbidden',
	RATE_LIMITED: 'rate_limited',
	SERVER_ERROR: 'server_error',
	TIMEOUT: 'timeout',
	UNKNOWN: 'unknown'
}

const ERROR_BY_STATUS = {
	400: BONUS_API_ERROR.BAD_REQUEST,
	401: BONUS_API_ERROR.UNAUTHORIZED,
	403: BONUS_API_ERROR.FORBIDDEN,
	429: BONUS_API_ERROR.RATE_LIMITED,
	500: BONUS_API_ERROR.SERVER_ERROR
}

const onlyDigits = value => String(value || '').replace(/\D/g, '')
const getStatus = res => res?.status ?? res?.statusCode
const pickPayload = res => (res && res.data !== undefined ? res.data : res)

const raiseError = (message, code) => {
	const error = new Error(message)
	error.code = code
	throw error
}

const isTimeoutError = error => error?.code === 'ECONNABORTED' || /timeout/i.test(error?.message || '')

const getSessionToken = async () => {
	const rawToken = await Vtex?.customer?.getCustomerToken?.()
	return typeof rawToken === 'string' ? rawToken : rawToken?.token || rawToken?.value || rawToken?.authCookieValue
}

/**
 * Fetches the shopper's bonus extract from the Monte Carlo gateway.
 * @param {string} cpf customer document, any format — digits are extracted here
 * @returns {Promise<{ wallets: object[], orders: object[], incentives: object[] }>}
 * @throws {Error} with a `code` from BONUS_API_ERROR when the gateway rejects the call
 */
export const fetchBonusExtract = async cpf => {
	const document = onlyDigits(cpf)
	if (!document) raiseError('CPF is required to fetch the bonus extract', BONUS_API_ERROR.BAD_REQUEST)

	const token = await getSessionToken()
	if (!token) raiseError('No active VTEX session token', BONUS_API_ERROR.UNAUTHORIZED)

	const headers = { ...JSON_HEADERS, Authorization: `Bearer ${token}` }
	// Eitri.http.post(url, data, config) works like axios: headers MUST be nested
	// under `config.headers` — passing a flat object here is silently ignored by
	// the native bridge (no headers actually go out on the wire).
	let res
	try {
		res = await Eitri.http.post(GATEWAY_URL, { cpf: document }, { headers, timeout: REQUEST_TIMEOUT_MS })
	} catch (error) {
		const isTimeout = isTimeoutError(error)
		Datadog.sendDatadogLogError(error, 'BonusExtractService.fetchBonusExtract', {
			isTimeout,
			timeoutMs: REQUEST_TIMEOUT_MS
		})
		if (isTimeout) {
			TrackingService.sendSalesforceEvent('bonus_gateway_timeout', { timeout_ms: REQUEST_TIMEOUT_MS })
		}
		raiseError(
			isTimeout ? 'Bonus gateway request timed out' : 'Bonus gateway request failed',
			isTimeout ? BONUS_API_ERROR.TIMEOUT : BONUS_API_ERROR.UNKNOWN
		)
	}

	const status = getStatus(res)
	if (status && status >= 400) raiseError(`Bonus gateway returned ${status}`, ERROR_BY_STATUS[status] || BONUS_API_ERROR.UNKNOWN)

	const payload = pickPayload(res)
	if (!payload?.success) raiseError('Bonus gateway returned an unsuccessful response', BONUS_API_ERROR.UNKNOWN)

	return {
		wallets: payload.data?.wallets || [],
		orders: payload.data?.orders || [],
		incentives: payload.data?.incentives || []
	}
}

export default { fetchBonusExtract, BONUS_API_ERROR }
