import { Vtex } from 'eitri-shopping-vtex-shared'
import { fetchClientCode } from './ContactLookupService'

const CONTACT_KEY_STORAGE = 'contact_key'

export const saveContactKeyOnStorage = async (contactKey: string): Promise<void> => {
	try {
		await Vtex.customer.setCustomerData(CONTACT_KEY_STORAGE, contactKey)
	} catch (e) {
		console.log('saveContactKeyOnStorage error', e)
	}
}

export const loadContactKeyFromStorage = async (): Promise<string | null> => {
	try {
		return await Vtex.customer.getCustomerData(CONTACT_KEY_STORAGE)
	} catch (e) {
		console.log('loadContactKeyFromStorage error', e)
		return null
	}
}

export const clearContactKeyFromStorage = async (): Promise<void> => {
	try {
		await Vtex.customer.setCustomerData(CONTACT_KEY_STORAGE, '')
	} catch (e) {
		console.log('clearContactKeyFromStorage error', e)
	}
}

// 1h entre tentativas para clientes sem codigo (chave atual e e-mail ou null).
const CONTACT_KEY_REFRESH_INTERVAL_MS = 60 * 60 * 1000

// 5min quando a ultima tentativa FALHOU (timeout, rede, sessao ausente).
// Evita esperar 1h inteira apos uma oscilacao temporaria de rede, sem o que o
// e-mail ficaria congelado por muito tempo, mas ainda protege contra um backend
// fora do ar gerando chamadas em loop — sem isso qualquer erro de rede ou 5xx
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
export const refreshContactKeyIfStale = async (): Promise<void> => {
	try {
		if (!(await Vtex.customer.isLoggedIn())) return

		const current = await loadContactKeyFromStorage()
		const isAlreadyClientCode = Boolean(current && !current.includes('@'))
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
 * @param [email] identidade de fallback; quando omitido, cai no
 * e-mail do perfil (login social, onde o cliente nao digitou e-mail)
 * @returns a contact key gravada
 */
export const resolveContactKey = async (email?: string): Promise<string | null> => {
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

const getProfileEmail = async (): Promise<string | undefined> => {
	try {
		const result = await (Vtex.customer as any).getCustomerProfile()
		return (result as any)?.data?.profile?.email
	} catch (e) {
		console.log('getProfileEmail error', e)
	}
}

/**
 * Registra a contact key no addon nativo do Salesforce. Isolado e engolido
 * para um modulo ausente ou com falha nunca quebrar o login.
 */
const notifyIdentity = async (contactKey: string, email?: string): Promise<void> => {
	try {
		await (Vtex.customer as any).notifyLoginToExposedApis(contactKey, email || '')
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
