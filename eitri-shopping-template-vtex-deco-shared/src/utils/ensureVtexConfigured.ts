import { App, Vtex } from 'eitri-shopping-vtex-shared'

/**
 * Garante que a VTEX esteja configurada no contexto do app SHARED.
 *
 * O bundle do eitri-shopping-template-vtex-deco-shared tem sua própria instância de
 * eitri-shopping-vtex-shared, nunca configurada pelo host — sem isso, qualquer
 * chamada Vtex.* feita por código do shared (hooks, seções) usa host vazio e
 * falha silenciosamente. Chame antes de qualquer chamada Vtex feita fora da
 * árvore do `DecoCMSContentRender` (que já chama isso por conta própria).
 */
export default async function ensureVtexConfigured(): Promise<void> {
	if ((Vtex as any)?.configs?.host) return
	try {
		await App.tryAutoConfigure({ verbose: false, gaVerbose: false })
	} catch (error) {
		console.error('[ensureVtexConfigured] Falha ao configurar a VTEX no contexto shared', error)
	}
}
