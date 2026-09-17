import { Vtex } from 'eitri-shopping-vtex-shared'

export const listSubscriptions = async status => {
	return await Vtex.subscription.listSubscriptions({ status })
}

export const getSubscription = async id => {
	return await Vtex.subscription.getSubscription(id)
}

export const updateSubscription = async (id, payload) => {
	return await Vtex.subscription.updateSubscription(id, payload)
}

export const updateSubscriptionItem = async (id, itemId, payload) => {
	return await Vtex.subscription.updateItem(id, itemId, payload)
}

export const removeSubscriptionItem = async (id, itemId) => {
	return await Vtex.subscription.removeItem(id, itemId)
}

export const listSubscriptionCycles = async subscriptionId => {
	return await Vtex.subscription.listCycles({ subscriptionId })
}

export const simulateSubscription = async id => {
	return await Vtex.subscription.simulateSubscription(id)
}
