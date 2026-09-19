import Eitri from 'eitri-bifrost'

const CREDENTIALS_KEY = 'biometric_credentials'
const STORAGE_OPTIONS = { secure: true, shared: true }

export interface BiometricCredentials {
	email?: string
	password?: string
	[key: string]: unknown
}

export const isBiometricAvailable = async (): Promise<boolean> => {
	try {
		if (!Eitri.canIUse('10')) return false
		const result = await Eitri.biometrics.checkStatus()
		return result?.status === 'AVAILABLE'
	} catch (e) {
		console.error('Erro ao verificar disponibilidade da biometria', e)
		return false
	}
}

export const hasSavedCredentials = async (): Promise<boolean> => {
	try {
		const credentials = await Eitri.storage.getItemJson(CREDENTIALS_KEY, STORAGE_OPTIONS)
		return Boolean(credentials?.email)
	} catch (e) {
		return false
	}
}

const authenticate = async (): Promise<boolean> => {
	try {
		const result = await Eitri.biometrics.authenticate({
			android: {
				promptInfo: {
					title: 'Autenticação biométrica',
					subtitle: 'Confirme sua identidade para continuar.',
					cancelButton: 'Cancelar'
				}
			},
			ios: {
				authenticationReason: 'Autenticação biométrica.'
			}
		})
		return result?.result === 'SUCCESS'
	} catch (e) {
		console.error('Erro na autenticação biométrica', e)
		return false
	}
}

export const saveCredentialsWithBiometrics = async (email?: string | null, password?: string): Promise<boolean> => {
	try {
		const authenticated = await authenticate()
		if (!authenticated) return false
		await Eitri.storage.setItemJson(CREDENTIALS_KEY, { email, password }, STORAGE_OPTIONS)
		return true
	} catch (e) {
		console.error('Erro ao salvar credenciais com biometria', e)
		return false
	}
}

export const updateSavedCredentials = async (email?: string | null, password?: string): Promise<boolean> => {
	try {
		await Eitri.storage.setItemJson(CREDENTIALS_KEY, { email, password }, STORAGE_OPTIONS)
		return true
	} catch (e) {
		console.error('Erro ao atualizar credenciais salvas', e)
		return false
	}
}

export const getSavedCredentials = async (): Promise<BiometricCredentials | null> => {
	try {
		const authenticated = await authenticate()
		if (!authenticated) return null
		return await Eitri.storage.getItemJson(CREDENTIALS_KEY, STORAGE_OPTIONS)
	} catch (e) {
		console.error('Erro ao recuperar credenciais com biometria', e)
		return null
	}
}

export const clearSavedCredentials = async (): Promise<void> => {
	try {
		await Eitri.storage.removeItem(CREDENTIALS_KEY, STORAGE_OPTIONS)
	} catch (e) {
		console.error('Erro ao remover credenciais salvas', e)
	}
}
