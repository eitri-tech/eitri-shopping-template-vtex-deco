import { useState } from 'react'
import * as BiometricService from '../services/BiometricService'
import TrackingService from '../services/TrackingService'

let biometricLoginAttempted = false

export const resetBiometricLoginAttempt = () => { biometricLoginAttempted = false }

/**
 * @param {Function} [resolveContactKey] optional `(email) => Promise<string|null>`
 * injected by the host app (the lookup lives in the account app's
 * CustomerService, which this shared hook can't import). Resolve-lo registra a
 * identidade do cliente no addon do Salesforce via `session.notifyLogin`, sem
 * o que o login biometrico ficaria sem contact key — os outros fluxos de login
 * chamam o mesmo resolvedor.
 */
export default function useBiometricLogin({ doLogin, isLoggedIn, onSuccess, resolveContactKey }) {
	const [showReauthModal, setShowReauthModal] = useState(false)
	const [reauthEmail, setReauthEmail] = useState('')

	const attemptBiometricLogin = async () => {
		try {
			if (biometricLoginAttempted) return
			if (await isLoggedIn()) return
			if (!(await BiometricService.isBiometricAvailable())) return
			if (!(await BiometricService.hasSavedCredentials())) return

			biometricLoginAttempted = true

			const credentials = await BiometricService.getSavedCredentials()
			if (!credentials?.email || !credentials?.password) return

			const loggedIn = await doLogin(credentials.email, credentials.password)
			if (loggedIn === 'Success') {
				await resolveContactKey?.(credentials.email)
				TrackingService.loginEvent('biometric')
				onSuccess?.()
				return
			}

			setReauthEmail(credentials.email)
			setShowReauthModal(true)
		} catch (e) {
			console.error('Erro ao logar com biometria', e)
		}
	}

	const handleReauthConfirm = async newPassword => {
		try {
			const loggedIn = await doLogin(reauthEmail, newPassword)
			if (loggedIn !== 'Success') return false

			await BiometricService.updateSavedCredentials(reauthEmail, newPassword)
			await resolveContactKey?.(reauthEmail)
			TrackingService.loginEvent('biometric')
			setShowReauthModal(false)
			onSuccess?.()
			return true
		} catch (e) {
			console.error('Erro ao reautenticar e atualizar a senha salva', e)
			return false
		}
	}

	const dismissReauthModal = () => setShowReauthModal(false)

	return {
		attemptBiometricLogin,
		showReauthModal,
		reauthEmail,
		handleReauthConfirm,
		dismissReauthModal
	}
}
