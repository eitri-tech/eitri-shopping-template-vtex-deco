import Eitri from 'eitri-bifrost'
import { Vtex } from 'eitri-shopping-vtex-shared'
import Datadog from './Datadog'

/**
 * Resolves the client code (Master Data "CL" id) for the logged-in shopper,
 * via a custom VTEX IO app — see your store's contact-lookup API repo.
 *
 * That endpoint validates the shopper's own live VTEX session token
 * server-side (against VTEX ID) and only ever returns the code for that
 * same identity — it never accepts an email/CPF param from the client.
 * This is what lets the app use the same client code as the store/
 * e-commerce for Marketing Cloud tracking, instead of the VTEX user id.
 */

// TODO: replace with your VTEX account name (e.g. 'https://YOUR_VTEX_ACCOUNT.myvtex.com/_v/contact-lookup')
const CONTACT_LOOKUP_URL = 'https://YOUR_VTEX_ACCOUNT.myvtex.com/_v/contact-lookup'

// O VTEX IO app escala a zero: quente responde em ~0.3-0.6s, mas o cold start
// medido foi de ~8.6s só para devolver o 401 — somando as duas consultas ao
// Master Data, o timeout anterior de 10s estourava e a chamada nunca completava.
// ponytail: se o cold start incomodar, a saída é manter o app quente (ping
// periódico / minReplicas), não continuar subindo este número.
const REQUEST_TIMEOUT_MS = 25000

const getSessionToken = async (): Promise<string | undefined> => {
	const rawToken = await (Vtex?.customer as any)?.getCustomerToken?.()
	return typeof rawToken === 'string' ? rawToken : rawToken?.token || rawToken?.value || rawToken?.authCookieValue
}

export interface ClientCodeResult {
	ok: boolean
	clientCode: string | null
}

/**
 * "Sem codigo" e "a consulta falhou" precisam ser distinguiveis: quem so olha
 * `null` grava o e-mail como identidade definitiva por causa de um timeout
 * transitorio (ver resolveContactKey no app de conta).
 *
 * @returns {Promise<{ok: boolean, clientCode: string|null}>} `ok` true quando
 * o endpoint respondeu — `clientCode` null ai significa cliente sem codigo
 * ainda (primeira nota nao faturada). `ok` false e falha de consulta: sem
 * sessao, timeout, erro de rede ou HTTP.
 */
export const fetchClientCode = async (): Promise<ClientCodeResult> => {
	const token = await getSessionToken()
	if (!token) return { ok: false, clientCode: null }

	try {
		// Eitri.http.get(url, config) works like axios: headers MUST be nested
		// under `config.headers`.
		const res = await Eitri.http.get(CONTACT_LOOKUP_URL, {
			// NÃO usar o header `VtexIdclientAutCookie`: o roteador do VTEX IO o
			// trata como credencial de admin e rejeita token de cliente
			// (audience `webstore`) com 401 antes de chegar no app. O app IO lê
			// este header alternativo.
			headers: { 'X-Vtex-Customer-Auth': token },
			timeout: REQUEST_TIMEOUT_MS
		})
		const payload = res?.data ?? res
		return { ok: true, clientCode: payload?.data?.codigoCliente ?? null }
	} catch (error: any) {
		// `code` é o que distingue timeout (ECONNABORTED) de erro de resposta;
		// sem ele o diagnóstico fica cego. Nunca serializar o erro cru: um erro
		// de HTTP client costuma carregar o request config junto, incluindo o
		// header X-Vtex-Customer-Auth.
		Datadog.sendDatadogLogError(error as any, 'ContactLookupService.fetchClientCode', {
			code: error?.code,
			status: error?.status || error?.response?.status,
			timeoutMs: REQUEST_TIMEOUT_MS
		})
		return { ok: false, clientCode: null }
	}
}

export default { fetchClientCode }
