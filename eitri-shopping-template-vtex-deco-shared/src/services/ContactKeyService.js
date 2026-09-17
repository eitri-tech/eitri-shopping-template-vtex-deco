import { Vtex } from 'eitri-shopping-vtex-shared'
import { fetchClientCode } from './ContactLookupService'

/**
 * Contact key do Marketing Cloud: o codigo de cliente da loja quando
 * existe, o e-mail do cliente como fallback enquanto nao existe (o codigo so
 * aparece na APP_Salesforce depois da primeira nota faturada).
 *
 * Mora no shared, e nao no app de conta, porque a promocao de e-mail para
 * codigo precisa acontecer na abertura do app — e a maioria das aberturas cai
 * na Home do app `home` (aba Inicio), nao na aba Perfil.
 */

export const saveContactKeyOnStorage = async contactKey => {
	return await Vtex.customer.setCustomerData('contactKey', contactKey)
}

export const loadContactKeyFromStorage = async () => {
	return await Vtex.customer.getCustomerData('contactKey')
}

export const clearContactKeyFromStorage = async () => {
	// Espelha o notifyLogin do resolveContactKey: sem isso o addon do Salesforce
	// segue com a identidade do usuario anterior depois do logout.
	try {
		await Vtex.customer.notifyLogoutToExposedApis()
	} catch (e) {
		console.log('notifyLogoutToExposedApis error', e)
	}
	await Vtex.customer.setCustomerData('contactKeyCheckedAt', null)
	return await Vtex.customer.setCustomerData('contactKey', null)
}

// Janela curta de proposito: quanto menor, mais cedo a chave e promovida depois
// que o codigo passa a existir. Uma janela longa (testamos 24h) desperdicava a
// abertura do cliente — se ele abrisse o app pouco depois do codigo aparecer mas
// dentro da janela, a atualizacao ficava para o dia seguinte.
//
// O custo e baixo porque a guarda de "a chave ainda e e-mail?" restringe isso a
// comprador novo, num estado transitorio: assim que promove, sao zero consultas
// para sempre.
//
// A janela nao vai a zero porque os listeners de resume disparam a cada troca de
// aba de volta para o app — sem ela, alternar entre Inicio e Sacola geraria um
// lookup por toque.
const CONTACT_KEY_REFRESH_INTERVAL_MS = 60 * 60 * 1000

// Backoff so para consulta que FALHOU: mais curto que a janela normal (o cliente
// pode ter codigo agora mesmo), mas nao zero — sem ele o endpoint fora do ar
// geraria um lookup por troca de aba.
const CONTACT_KEY_FAILURE_RETRY_MS = 5 * 60 * 1000

/**
 * Promove a contact key de e-mail para codigo de cliente quando o codigo
 * passar a existir.
 *
 * Um comprador novo entra sem codigo e recebe o e-mail como chave. Dias depois
 * o codigo existe, mas como a sessao persiste o cliente nao passa mais pela
 * tela de login, que era o unico ponto que resolvia a chave — sem isso a chave
 * ficaria congelada no e-mail para sempre.
 *
 * Tambem cobre a chave ausente. `null` nao quer dizer "cliente sem codigo" —
 * quem nao tem codigo fica com o e-mail, nunca com null. `null` e o estado
 * "ainda nao resolvido neste aparelho": instalacao nova, storage limpo, ou
 * sessao que ja existia antes desta versao. Esse ultimo caso e a base
 * instalada inteira no primeiro upgrade; como a sessao persiste, esses
 * clientes nunca mais passariam pela tela de login e ficariam sem identidade
 * nenhuma no Marketing Cloud.
 *
 * Duas guardas para nao virar uma chamada por retorno ao app:
 * - so pula quando a chave ja e um codigo de cliente, que e definitivo e nunca
 *   precisa ser reconsultado; e-mail e ausencia de chave seguem resolvendo;
 * - no maximo uma tentativa por janela (1h; 5min quando a ultima falhou).
 *
 * Nunca lanca: e chamado em fire-and-forget no init das Homes.
 */
export const refreshContactKeyIfStale = async () => {
	try {
		if (!(await Vtex.customer.isLoggedIn())) return

		const current = await loadContactKeyFromStorage()
		const isAlreadyClientCode = !!current && !current.includes('@')
		if (isAlreadyClientCode) return

		const lastCheck = Number(await Vtex.customer.getCustomerData('contactKeyCheckedAt')) || 0
		if (Date.now() - lastCheck < CONTACT_KEY_REFRESH_INTERVAL_MS) return

		// O proprio resolveContactKey regrava o timestamp, entao o login tambem
		// conta como checagem e a janela comeca de la.
		await resolveContactKey()
	} catch (e) {
		console.log('refreshContactKeyIfStale error', e)
	}
}

/**
 * Resolve a contact key da sessao atual e a registra como identidade do
 * cliente: o codigo de cliente da loja quando o Master Data tem, o e-mail caso
 * contrario.
 *
 * A identidade chega no Marketing Cloud pelo `customerId` do
 * `session.notifyLogin`, que o addon do Salesforce mapeia para a contact key
 * (confirmado com o time de plataforma da Eitri). Mandar como atributo do
 * evento `login` NAO muda a identidade.
 *
 * Nunca lanca: um lookup que falha nao pode bloquear o login.
 * @param {string} [email] identidade de fallback; quando omitido, cai no
 * e-mail do perfil (login social, onde o cliente nao digitou e-mail)
 * @returns {Promise<string|null>} a contact key gravada
 */
export const resolveContactKey = async email => {
	try {
		const { ok, clientCode } = await fetchClientCode()
		const fallbackEmail = email || (await getProfileEmail())
		const contactKey = clientCode || fallbackEmail || null

		// O e-mail e gravado tambem quando a consulta FALHOU (timeout, rede,
		// sessao ausente): ficar sem identidade nenhuma no Marketing Cloud e
		// pior que uma identidade provisoria. O que a falha muda e so o prazo do
		// retry — ela nao e resposta, entao carimbamos um backoff curto em vez
		// da janela cheia, e o refreshContactKeyIfStale promove para o codigo
		// no proximo resume. Sem isso um timeout congelava o e-mail por 1h.
		//
		// Fora do if: o carimbo registra a TENTATIVA, nao o achado. Se ficar so
		// no caminho com chave, um cliente sem codigo e sem e-mail nunca escreve
		// o carimbo e o refresh volta a consultar a cada retorno ao app.
		const checkedAt = ok ? Date.now() : Date.now() - CONTACT_KEY_REFRESH_INTERVAL_MS + CONTACT_KEY_FAILURE_RETRY_MS
		await Vtex.customer.setCustomerData('contactKeyCheckedAt', String(checkedAt))
		if (contactKey) {
			await saveContactKeyOnStorage(contactKey)
			await notifyIdentity(contactKey, fallbackEmail)
		}
		return contactKey
	} catch (e) {
		console.log('resolveContactKey error', e)
		return null
	}
}

const getProfileEmail = async () => {
	try {
		const result = await Vtex.customer.getCustomerProfile()
		return result?.data?.profile?.email
	} catch (e) {
		console.log('getProfileEmail error', e)
	}
}

/**
 * Registra a contact key no addon nativo do Salesforce. Isolado e engolido
 * para um modulo ausente ou com falha nunca quebrar o login.
 */
const notifyIdentity = async (contactKey, email) => {
	try {
		await Vtex.customer.notifyLoginToExposedApis(contactKey, email || '')
	} catch (e) {
		console.log('notifyIdentity error', e)
	}
}

export default {
	saveContactKeyOnStorage,
	loadContactKeyFromStorage,
	clearContactKeyFromStorage,
	refreshContactKeyIfStale,
	resolveContactKey
}
