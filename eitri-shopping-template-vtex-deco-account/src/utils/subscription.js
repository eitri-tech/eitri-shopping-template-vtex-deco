import { RemoteConfig } from 'eitri-shopping-vtex-shared'

const PERIOD_LABELS = {
	DAILY: ['dia', 'dias'],
	WEEKLY: ['semana', 'semanas'],
	MONTHLY: ['mês', 'meses'],
	YEARLY: ['ano', 'anos']
}

const UNIT_TO_PERIODICITY = {
	day: 'DAILY',
	days: 'DAILY',
	week: 'WEEKLY',
	weeks: 'WEEKLY',
	month: 'MONTHLY',
	months: 'MONTHLY',
	year: 'YEARLY',
	years: 'YEARLY'
}

export const STATUS_OPTIONS = ['ACTIVE', 'PAUSED', 'CANCELED']

export const STATUS_VARIANTS = {
	ACTIVE: 'success',
	PAUSED: 'warning',
	CANCELED: 'neutral',
	EXPIRED: 'neutral'
}

export const frequencyLabel = frequency => {
	const interval = frequency?.interval || 1
	const [singular, plural] = PERIOD_LABELS[frequency?.periodicity] || ['', '']
	return `A cada ${interval} ${interval === 1 ? singular : plural}`
}

export const frequencyKey = frequency => `${frequency?.interval}-${frequency?.periodicity}`

const FREQUENCY_KEY = 'vtex.subscription.key.frequency'

export const parseFrequencyOptions = (product, planId) => {
	const assemblyId = RemoteConfig.getContent('appConfigs.pdp.subscription.assemblyIdSubscription')
	const assemblyOptions = (product?.itemMetadata?.items || [])
		.flatMap(item => item.assemblyOptions || [])
		.filter(
			option => option.id === assemblyId || option.id === planId || option.id?.startsWith('vtex.subscription')
		)
	const domain =
		assemblyOptions.flatMap(option => option.inputValues || []).find(input => input.label === FREQUENCY_KEY)
			?.domain || []
	return domain
		.map(value => {
			const [interval, unit] = String(value).trim().split(/\s+/)
			return { interval: Number(interval), periodicity: UNIT_TO_PERIODICITY[unit?.toLowerCase()] }
		})
		.filter(option => option.interval > 0 && option.periodicity)
}

export const subscriptionTitle = (subscription, products, t) => {
	if (subscription?.title) return subscription.title
	const items = subscription?.items || []
	if (items.length === 1 && products?.[items[0].skuId]?.name) return products[items[0].skuId].name
	return t('subscriptions.defaultTitle', { count: items.length })
}

export const cycleLabel = (cycle, t) => {
	if (cycle.friendlyMessage) return cycle.friendlyMessage
	return t(`subscriptions.cycleStatus.${cycle.status}`, t('subscriptions.cycleStatus.DEFAULT'))
}
