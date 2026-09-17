import Eitri from 'eitri-bifrost'

export const navigateToCheckout = (orderFormId?: string): void => {
	Eitri.nativeNavigation.open({
		slug: 'checkout',
		initParams: { orderFormId }
	})
}

export const openProduct = async (productId: string): Promise<void> => {
	try {
		Eitri.nativeNavigation.open({
			slug: 'pdp',
			initParams: { productId }
		})
	} catch (e) {
		console.error('navigate to PDP: Error trying to open PDP', e)
	}
}
