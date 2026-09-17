import { Vtex } from 'eitri-shopping-vtex-shared'

export const listSubscriptions = async (status?: string) => {
	return await Vtex.subscription.listSubscriptions({ status })
}

export const getSubscription = async (id: string) => {
	return await Vtex.subscription.getSubscription(id)
}

export const updateSubscription = async (id: string, payload: Record<string, unknown>) => {
	return await Vtex.subscription.updateSubscription(id, payload)
}

export const updateSubscriptionItem = async (id: string, itemId: string, payload: Record<string, unknown>) => {
	return await Vtex.subscription.updateItem(id, itemId, payload)
}

export const removeSubscriptionItem = async (id: string, itemId: string) => {
	return await Vtex.subscription.removeItem(id, itemId)
}

export const listSubscriptionCycles = async (subscriptionId: string) => {
	return await Vtex.subscription.listCycles({ subscriptionId })
}

export const simulateSubscription = async (id: string) => {
	return await Vtex.subscription.simulateSubscription(id)
}
