import Eitri from 'eitri-bifrost'
import { Vtex } from 'eitri-shopping-vtex-shared'
import { Datadog } from 'eitri-shopping-template-vtex-deco-shared'
import type { BonusExtract } from '../types/bonus'

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
} as const

export type BonusApiError = (typeof BONUS_API_ERROR)[keyof typeof BONUS_API_ERROR]

const ERROR_BY_STATUS: Record<number, BonusApiError> = {
	400: BONUS_API_ERROR.BAD_REQUEST,
	401: BONUS_API_ERROR.UNAUTHORIZED,
	403: BONUS_API_ERROR.FORBIDDEN,
	429: BONUS_API_ERROR.RATE_LIMITED,
	500: BONUS_API_ERROR.SERVER_ERROR
}

const onlyDigits = (value?: string | null): string => String(value || '').replace(/\D/g, '')
const getStatus = (res: any): number => res?.status ?? res?.statusCode
const pickPayload = (res: any): any => (res && res.data !== undefined ? res.data : res)

const raiseError = (message: string, code: BonusApiError): never => {
	const error = new Error(message) as Error & { code: BonusApiError }
	error.code = code
	throw error
}

const isTimeoutError = (error: any): boolean => error?.code === 'ECONNABORTED' || /timeout/i.test(error?.message || '')

const getSessionToken = async (): Promise<string | undefined> => {
	const rawToken = await (Vtex?.customer as any)?.getCustomerToken?.()
	return typeof rawToken === 'string' ? rawToken : rawToken?.token || rawToken?.value || rawToken?.authCookieValue
}

/**
 * Fetches the shopper's bonus extract from the Monte Carlo gateway.
 * @param cpf customer document, any format — digits are extracted here
 * @returns {Promise<BonusExtract>}
 * @throws {Error} with a `code` from BONUS_API_ERROR when the gateway rejects the call
 */
export const fetchBonusExtract = async (cpf: string): Promise<BonusExtract> => {
	const document = onlyDigits(cpf)
	if (!document) raiseError('CPF is required to fetch the bonus extract', BONUS_API_ERROR.BAD_REQUEST)

	const token = await getSessionToken()
	if (!token) raiseError('No active VTEX session token', BONUS_API_ERROR.UNAUTHORIZED)

	const headers = { ...JSON_HEADERS, Authorization: `Bearer ${token}` }
	// Eitri.http.post(url, data, config) works like axios: headers MUST be nested
	// under `config.headers` — passing a flat object here is silently ignored by
	// the native bridge (no headers actually go out on the wire).
	let res: any
	try {
		res = await Eitri.http.post(GATEWAY_URL, { cpf: document }, { headers, timeout: REQUEST_TIMEOUT_MS })
	} catch (error: any) {
		const isTimeout = isTimeoutError(error)
		Datadog.sendDatadogLogError(error as any, 'BonusExtractService.fetchBonusExtract', {
			isTimeout,
			timeoutMs: REQUEST_TIMEOUT_MS
		})
		if (isTimeout) {
			raiseError('Bonus gateway request timed out', BONUS_API_ERROR.TIMEOUT)
		}
		const status = getStatus(error?.response || error)
		const code = ERROR_BY_STATUS[status] || BONUS_API_ERROR.UNKNOWN
		raiseError(error?.message || 'Bonus gateway request failed', code)
	}

	const status = getStatus(res)
	if (status && (status < 200 || status >= 300)) {
		const code = ERROR_BY_STATUS[status] || BONUS_API_ERROR.UNKNOWN
		raiseError(`Bonus gateway returned HTTP ${status}`, code)
	}

	const payload = pickPayload(res)
	return {
		wallets: payload?.wallets || [],
		orders: payload?.orders || [],
		incentives: payload?.incentives || []
	}
}

export default { fetchBonusExtract, BONUS_API_ERROR }
