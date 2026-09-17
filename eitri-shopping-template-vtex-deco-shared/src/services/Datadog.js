import Eitri from 'eitri-bifrost'

export default class Datadog {
	static sendDatadogWarningLog = async (data = {}, method) => {
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

			Eitri.http.post('https://api.eitri.tech/analytics/event', payload, {
				'Content-Type': 'application/json',
				'application-id': window.__eitriAppConf?.applicationId
			})
		} catch (e) {
			console.error('Erro sendDatadogWarningLog', e)
		}
	}

	static sendDatadogInfoLog = async (data = {}, method) => {
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

			Eitri.http.post('https://api.eitri.tech/analytics/event', payload, {
				'Content-Type': 'application/json',
				'application-id': window.__eitriAppConf?.applicationId
			})
		} catch (e) {
			console.error('Erro sendDatadogInfoLog', e)
		}
	}

	static sendDatadogLogError = async (error, method, data = {}) => {
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

			Eitri.http.post('https://api.eitri.tech/analytics/event', payload, {
				'Content-Type': 'application/json',
				'application-id': window.__eitriAppConf?.applicationId
			})
		} catch (e) {
			console.error('Erro sendLogError', e)
		}
	}
}
