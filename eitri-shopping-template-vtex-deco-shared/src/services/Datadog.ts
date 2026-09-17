import Eitri from 'eitri-bifrost'

export default class Datadog {
	static sendDatadogWarningLog = async (data: Record<string, unknown> = {}, method?: string): Promise<void> => {
		try {
			const payload = {
				origin: 'APP-SHOPPING-WARNING',
				eventName: `${window.__eitriAppConf?.slug}`,
				data: {
					application: window.__eitriAppConf?.application || '',
					slug: window.__eitriAppConf?.slug,
					applicationId: window.__eitriAppConf?.applicationId,
					version: window.__eitriAppConf?.version,
					method: method || '',
					...data
				}
			}

			const environment = await Eitri.environment.getName()
			if (environment === 'dev') {
				console.log('===Warning===', payload)
				return
			}

			// HttpConfig expects headers nested under `headers` — passing them flat here silently
			// dropped the `application-id` header, breaking analytics attribution in production.
			Eitri.http.post('https://api.eitri.tech/analytics/event', payload, {
				headers: {
					'Content-Type': 'application/json',
					'application-id': window.__eitriAppConf?.applicationId
				}
			})
		} catch (e) {
			console.error('Erro sendDatadogWarningLog', e)
		}
	}

	static sendDatadogInfoLog = async (data: Record<string, unknown> = {}, method?: string): Promise<void> => {
		try {
			const payload = {
				origin: 'APP-SHOPPING-INFO',
				eventName: `${window.__eitriAppConf?.slug}`,
				data: {
					application: window.__eitriAppConf?.application || '',
					slug: window.__eitriAppConf?.slug,
					applicationId: window.__eitriAppConf?.applicationId,
					version: window.__eitriAppConf?.version,
					method: method || '',
					...data
				}
			}

			const environment = await Eitri.environment.getName()
			if (environment === 'dev') {
				console.log('===Info===', payload)
				return
			}

			// HttpConfig expects headers nested under `headers` — passing them flat here silently
			// dropped the `application-id` header, breaking analytics attribution in production.
			Eitri.http.post('https://api.eitri.tech/analytics/event', payload, {
				headers: {
					'Content-Type': 'application/json',
					'application-id': window.__eitriAppConf?.applicationId
				}
			})
		} catch (e) {
			console.error('Erro sendDatadogInfoLog', e)
		}
	}

	static sendDatadogLogError = async (
		error: (Error & Record<string, unknown>) | null | undefined,
		method?: string,
		data: Record<string, unknown> = {}
	): Promise<void> => {
		try {
			const device = await Eitri.device.getInfos()

			const payload = {
				origin: 'APP-SHOPPING-ERROR',
				eventName: `${window.__eitriAppConf?.slug}`,
				data: {
					application: window.__eitriAppConf?.application || '',
					slug: window.__eitriAppConf?.slug,
					applicationId: window.__eitriAppConf?.applicationId,
					version: window.__eitriAppConf?.version,
					device,
					method: method || '',
					error: error
						? {
								message: error?.message,
								stack: error?.stack,
								name: error?.name,
								...error
							}
						: null,
					...data
				}
			}

			const environment = await Eitri.environment.getName()
			if (environment === 'dev') {
				console.log('===sendLogError===', payload)
				return
			}

			// HttpConfig expects headers nested under `headers` — passing them flat here silently
			// dropped the `application-id` header, breaking analytics attribution in production.
			Eitri.http.post('https://api.eitri.tech/analytics/event', payload, {
				headers: {
					'Content-Type': 'application/json',
					'application-id': window.__eitriAppConf?.applicationId
				}
			})
		} catch (e) {
			console.error('Erro sendLogError', e)
		}
	}
}
