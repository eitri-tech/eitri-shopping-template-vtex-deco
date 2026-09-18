import Eitri from 'eitri-bifrost'
import Datadog from './Datadog'
import type { VtexCart, VtexCartItem, VtexProduct } from '../types/vtex'

type GaCategoryMap = Record<string, string | undefined>

type SalesforceLogEvent = (event: { eventName: string; data: Record<string, unknown> }) => Promise<unknown>

// Salesforce only accepts flat scalar attributes.
type SalesforceEventData = Record<string, string | number | boolean>

/**
 * `addPaymentInfoEvent` only reads `paymentData`, `totalizers`, `value`, and `items` off the
 * cart — typing it against the full `VtexCart` forced every caller's cart (each app keeps its
 * own, intentionally-duplicated `VtexCart` — see AGENTS.md) to structurally match this
 * package's own `VtexCart` exactly, including fields this function never touches
 * (shippingData/address). A minimal shape lets any app's cart satisfy it without that coupling.
 */
interface PaymentInfoCart {
	paymentData?: {
		payments?: Array<{ paymentSystem?: string; [key: string]: unknown }>
		paymentSystems?: Array<{ stringId?: string; name?: string; [key: string]: unknown }>
		[key: string]: unknown
	}
	totalizers?: Array<{ id?: string; value?: number; [key: string]: unknown }>
	value?: number
	items: Array<{
		productId?: string
		name?: string
		productName?: string
		nameComplete?: string
		price?: number
		[key: string]: unknown
	}>
}

export default class TrackingService {
	static _logInTerminal = (...args: unknown[]): void => {
		const TURNED_ON = false
		if (!TURNED_ON) return
		console.log('[TRACKING]', ...args)
	}

	static _sfModulePromise: Promise<SalesforceLogEvent | null> | null = null

	static _getSfLogEvent = async (): Promise<SalesforceLogEvent | null> => {
		if (!TrackingService._sfModulePromise) {
			TrackingService._sfModulePromise = Eitri.modules()
				.then(
					(modules: { salesforce?: { logEvent?: SalesforceLogEvent } } | undefined) =>
						modules?.salesforce?.logEvent ?? null
				)
				.catch(() => null)
		}
		return TrackingService._sfModulePromise
	}

	static sendSalesforceEvent = async (eventName: string, data: Record<string, unknown> = {}): Promise<void> => {
		try {
			const logEvent = await TrackingService._getSfLogEvent()
			if (!logEvent) {
				console.warn('[Salesforce] Module unavailable, event not sent:', eventName)
				Datadog.sendDatadogWarningLog({ eventName, reason: 'salesforce_module_unavailable' }, 'sendSalesforceEvent')
				return
			}
			await logEvent({ eventName, data })
			TrackingService._logInTerminal('Salesforce', eventName, data)
		} catch (error) {
			console.error('[Salesforce] Error on', eventName, error)
			Datadog.sendDatadogLogError(error as Error & Record<string, unknown>, 'sendSalesforceEvent', { eventName })
		}
	}

	static _flattenForSalesforce = (data: Record<string, unknown> = {}): SalesforceEventData => {
		const result: SalesforceEventData = {}
		for (const [key, value] of Object.entries(data)) {
			if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
				result[key] = value
			}
		}
		return result
	}

	static _resolveCategory = (item: VtexCartItem): GaCategoryMap => {
		// productCategoryIds/productCategories can both be missing on legacy cart items —
		// falling through to [] instead of crashing on a bare .filter()/index access.
		let ids =
			item.productCategoryIds?.split('/').filter(Boolean) ||
			(item.categoriesIds as string[] | undefined)?.[0]?.split('/').filter(Boolean) ||
			[]
		let categories =
			item.productCategories || (item.categories as string[] | undefined)?.[0]?.split('/').filter(Boolean) || []
		let result: GaCategoryMap = {}

		ids.forEach((id, index) => {
			const key = index === 0 ? 'item_category' : `item_category${index + 1}`
			result[key] = item.productCategories ? (categories as GaCategoryMap)[id] : (categories as string[])[index]
		})

		return result
	}

	static _resolveInsiderProductMetadata = (product: VtexProduct) => {
		const availableSku = product.items?.find(item =>
			item.sellers?.some(seller => (seller.commertialOffer?.AvailableQuantity ?? 0) > 0)
		)
		const mainSeller = availableSku?.sellers?.find(seller => seller.sellerDefault) || availableSku?.sellers?.[0]

		return {
			productID: product?.productId,
			name: product?.productName,
			taxonomy: product?.categoryTree?.map(i => i.name) || [],
			imageURL: product?.items?.[0]?.images?.[0]?.imageUrl || '',
			price: mainSeller?.commertialOffer?.Price || 0,
			currency: 'BRL'
		}
	}

	static _resolveGAProductMetadata = (product: VtexProduct) => {
		const categories = product?.categoryTree?.reduce<GaCategoryMap>((acc, curr, index) => {
			if (index === 0) {
				acc[`item_category`] = curr.name
			} else {
				acc[`item_category${index + 1}`] = curr.name
			}
			return acc
		}, {})

		const availableSku = product.items?.find(item =>
			item.sellers?.some(seller => (seller.commertialOffer?.AvailableQuantity ?? 0) > 0)
		)
		const mainSeller = availableSku?.sellers?.find(seller => seller.sellerDefault) || availableSku?.sellers?.[0]

		return {
			item_id: product.productId,
			item_name: product.productName,
			item_brand: product.brand || '',
			...categories,
			price: mainSeller?.commertialOffer?.Price
		}
	}

	static _resolveGACartItemMetadata = (item: VtexCartItem & { priceDefinition?: { calculatedSellingPrice?: number } }) => {
		const categories = Object.values(item?.productCategories ?? {}).reduce<GaCategoryMap>((acc, curr, index) => {
			if (index === 0) {
				acc[`item_category`] = curr
			} else {
				acc[`item_category${index + 1}`] = curr
			}
			return acc
		}, {})

		return {
			item_id: item.productId,
			item_name: item.name,
			item_brand: item.additionalInfo?.brandName || '',
			...categories,
			price: (item?.priceDefinition?.calculatedSellingPrice ?? 0) / 100,
			quantity: item.quantity
		}
	}

	static sendScreenView = async (friendlyScreenName: string, screenFilename: string): Promise<void> => {
		Eitri.exposedApis.fb.currentScreen({ screen: friendlyScreenName, screenClass: screenFilename })

		// Salesforce
		TrackingService.sendSalesforceEvent('screen_view', {
			screen_name: friendlyScreenName || '',
			screen_class: screenFilename || ''
		})
	}

	static insiderVisitHomepage = async (): Promise<void> => {
		Eitri.exposedApis.insider.visitHomepage()
	}

	static sendRecommendedGaEvent = async (eventName: string, data: Record<string, unknown> = {}): Promise<void> => {
		await Eitri.exposedApis.fb.logEvent({ eventName, data })
		this._logInTerminal('GA', eventName, data)
	}

	/**
	 * Registra quando um anúncio é exibido para o usuário.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#ad_impression
	 */
	static adImpressionEvent = async (data: Record<string, unknown>): Promise<void> => {
		TrackingService.sendRecommendedGaEvent('ad_impression', data)
		TrackingService.sendSalesforceEvent('ad_impression', TrackingService._flattenForSalesforce(data))
	}

	/**
	 * Registra quando o usuário envia dados de pagamento no checkout.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#add_payment_info
	 */
	static addPaymentInfoEvent = async (cart: PaymentInfoCart, paymentType?: string): Promise<void> => {
		try {
			if (!paymentType) {
				const paymentId = cart.paymentData?.payments?.[0]?.paymentSystem
				paymentType = cart.paymentData?.paymentSystems?.find(p => p.stringId === paymentId)?.name
			}

			// evento enviado automaticamente pelo Vtex service se autoTriggerGAEvents() for true
			const totalizer = cart?.totalizers?.find(i => i.id === 'Items')
			const value = totalizer?.value ? totalizer.value / 100 : cart.value ? cart.value / 100 : ''

			TrackingService.sendRecommendedGaEvent('add_payment_info', {
				currency: 'BRL',
				payment_type: paymentType || '',
				value: value,
				items: cart.items.map(item => ({
					item_id: item.productId,
					item_name: item.name || item.productName || item.nameComplete,
					price: item.price ? item.price / 100 : ''
				}))
			})

			// TrackingService.inngageEvent('add_payment_info', {
			// 	currency: 'BRL',
			// 	payment_type: paymentType || ''
			// })

			// Salesforce
			try {
				TrackingService.sendSalesforceEvent('add_payment_info', {
					currency: 'BRL',
					payment_type: paymentType || '',
					value: value || 0,
					items_count: cart.items?.length || 0
				})
			} catch (e) {
				console.error('[Salesforce] Error on add_payment_info', e)
			}
		} catch (e) {
			console.log('Error on trackAddPaymentInfo', e)
		}
	}

	/**
	 * Registra quando o usuário envia dados de frete no checkout.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#add_shipping_info
	 */
	static addShippingInfoEvent = async (cart: VtexCart): Promise<void> => {
		try {
			const items = cart.items.map(item => {
				const categories = TrackingService._resolveCategory(item)

				return {
					item_id: item.id,
					item_name: item.name,
					item_brand: item.additionalInfo?.brandName,
					...categories,
					price: (item.sellingPrice ?? 0) / 100,
					quantity: item.quantity
				}
			})

			let shippingSelected = cart?.shippingData?.logisticsInfo?.map(item => item.selectedSla)
			const uniqueSla = [...new Set(shippingSelected)]

			const totalItemPrice = (cart.totalizers?.find(item => item.id === 'Items')?.value ?? 0) / 100

			const params = {
				currency: cart?.storePreferencesData?.currencyCode || 'BRL',
				value: totalItemPrice,
				shipping_tier: uniqueSla.join(';'),
				items: items
			}
			TrackingService.sendRecommendedGaEvent('add_shipping_info', params)
		} catch (error) {
			console.error('[SHARED] Error on addShippingInfo', error)
		}

		// Salesforce
		try {
			const sfShipping = cart?.shippingData?.logisticsInfo?.map(item => item.selectedSla)
			const sfUniqueSla = [...new Set(sfShipping)]
			const sfTotalItemPrice = (cart.totalizers?.find(item => item.id === 'Items')?.value ?? 0) / 100

			TrackingService.sendSalesforceEvent('add_shipping_info', {
				currency: cart?.storePreferencesData?.currencyCode || 'BRL',
				value: sfTotalItemPrice || 0,
				shipping_tier: sfUniqueSla.join(';'),
				items_count: cart.items?.length || 0
			})
		} catch (e) {
			console.error('[Salesforce] Error on add_shipping_info', e)
		}
	}

	/**
	 * Registra quando um item é adicionado ao carrinho.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#add_to_cart
	 */
	static addToCartEvent = async (product: VtexProduct): Promise<void> => {
		const item = this._resolveGAProductMetadata(product)

		// GA
		try {
			const params = {
				currency: 'BRL',
				value: item.price,
				items: [item]
			}
			TrackingService.sendRecommendedGaEvent('add_to_cart', params)
		} catch (e) {
			console.error('Error on analytics addItemToCart', e)
		}

		// Insider
		try {
			const productMetadata = this._resolveInsiderProductMetadata(product)
			const payload = {
				product: productMetadata
			}
			this._logInTerminal('insider', 'itemAddedToCart', payload)
			Eitri.exposedApis.insider.itemAddedToCart(payload)
		} catch (error) {
			console.error(error, 'insider.addItemToCart')
		}

		// Salesforce
		try {
			TrackingService.sendSalesforceEvent('add_to_cart', {
				currency: 'BRL',
				value: item.price || 0,
				item_id: item.item_id || '',
				item_name: item.item_name || '',
				item_brand: item.item_brand || ''
			})
		} catch (e) {
			console.error('[Salesforce] Error on add_to_cart', e)
		}
	}

	/**
	 * Registra quando um item é adicionado à lista de desejos.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#add_to_wishlist
	 */
	static addToWishlistEvent = async (data: {
		items?: Array<{ item_id?: string; item_name?: string; [key: string]: unknown }>
		currency?: string
		value?: number
		[key: string]: unknown
	}): Promise<void> => {
		TrackingService.sendRecommendedGaEvent('add_to_wishlist', data)

		// Salesforce
		try {
			const sfData: SalesforceEventData = {}
			const firstItem = data?.items?.[0]
			if (firstItem) {
				sfData.item_id = firstItem.item_id || ''
				sfData.item_name = firstItem.item_name || ''
			}
			if (data?.currency) sfData.currency = data.currency
			if (data?.value != null) sfData.value = data.value
			TrackingService.sendSalesforceEvent('add_to_wishlist', sfData)
		} catch (e) {
			console.error('[Salesforce] Error on add_to_wishlist', e)
		}
	}

	/**
	 * Registra quando o usuário inicia o checkout.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#begin_checkout
	 */
	static beginCheckoutEvent = async (cart: VtexCart): Promise<void> => {
		try {
			const totalizer = cart?.totalizers?.find(i => i.id === 'Items')
			const value = totalizer?.value ? totalizer.value / 100 : cart.value ? cart.value / 100 : ''

			TrackingService.sendRecommendedGaEvent('begin_checkout', {
				currency: 'BRL',
				value: value,
				coupon: cart.marketingData?.coupon || '',
				items: cart.items.map(item => this._resolveGACartItemMetadata(item))
			})
		} catch (e) {
			console.log('Error on trackBeginCheckout', e)
		}

		// Salesforce
		try {
			const sfTotalizer = cart?.totalizers?.find(i => i.id === 'Items')
			const sfValue = sfTotalizer?.value ? sfTotalizer.value / 100 : cart.value ? cart.value / 100 : 0
			TrackingService.sendSalesforceEvent('begin_checkout', {
				currency: 'BRL',
				value: sfValue,
				coupon: cart.marketingData?.coupon || '',
				items_count: cart.items?.length || 0,
				item_ids: cart.items?.map(i => i.productId).join(',') || ''
			})
		} catch (e) {
			console.error('[Salesforce] Error on begin_checkout', e)
		}
	}

	/**
	 * Registra quando o usuário faz login.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#login
	 *
	 * Nao carrega a contact key: a identidade do Marketing Cloud vem do
	 * `customerId` do `session.notifyLogin` (ver resolveContactKey no app de
	 * conta), nao de atributo de evento.
	 */
	static loginEvent = async (method: string): Promise<void> => {
		// GA
		TrackingService.sendRecommendedGaEvent('login', { method })

		// Insider
		Eitri.exposedApis.insider.signUpConfirmation()

		// Salesforce
		TrackingService.sendSalesforceEvent('login', { method: method || '' })
	}

	/**
	 * Registra uma compra concluída.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#purchase
	 */
	static purchaseEvent = async (cart: VtexCart, orderId?: string): Promise<void> => {
		// GA
		try {
			const items = cart.items.map(item => {
				const categories = TrackingService._resolveCategory(item)

				return {
					item_id: item.id,
					item_name: item.name,
					item_brand: item.additionalInfo?.brandName,
					...categories,
					price: (item.sellingPrice ?? 0) / 100,
					quantity: item.quantity
				}
			})

			// const totalItemPrice = cart.totalizers.find(item => item.id === 'Items')?.value / 100
			const shippingPrice = (cart.totalizers?.find(item => item.id === 'Shipping')?.value ?? 0) / 100

			const coupon = cart?.marketingData?.coupon || undefined

			const params = {
				currency: 'BRL',
				value: cart?.value && cart.value > 0 ? cart.value / 100 : 0,
				transaction_id: orderId,
				shipping: shippingPrice,
				items: items,
				...(coupon && { coupon })
			}
			TrackingService._logInTerminal('ga', 'purchase', params)
			TrackingService.sendRecommendedGaEvent('purchase', params)
		} catch (error) {
			console.error('Erro ao montar log de compra', error)
		}

		// Insider
		try {
			for (const item of cart.items) {
				try {
					const insiderPayload = {
						saleID: cart?.orderFormId,
						product: {
							productID: `${item?.productId || ''}`,
							name: item?.name || '',
							// productCategories can be missing on legacy cart items; Object.values(undefined)
							// throws, taking down the whole purchase event instead of just skipping taxonomy.
							taxonomy: Object.values(item.productCategories ?? {}),
							imageURL: item?.imageUrl || '',
							price: item?.price || 0,
							currency: 'BRL'
						}
					}
					TrackingService._logInTerminal('insider', 'itemPurchased', insiderPayload)
					Eitri.exposedApis.insider.itemPurchased(insiderPayload)
				} catch (e) {
					console.error('insider.purchaseItem', e)
				}
			}
		} catch (e) {
			console.error('insider.purchase', e)
		}

		// Salesforce
		try {
			const sfShippingPrice = (cart.totalizers?.find(item => item.id === 'Shipping')?.value ?? 0) / 100

			TrackingService.sendSalesforceEvent('purchase', {
				currency: 'BRL',
				value: cart?.value && cart.value > 0 ? cart.value / 100 : 0,
				transaction_id: orderId || '',
				shipping: sfShippingPrice || 0,
				coupon: cart?.marketingData?.coupon || '',
				items_count: cart.items?.length || 0,
				item_ids: cart.items?.map(i => i.productId).join(',') || '',
				item_names: cart.items?.map(i => i.name).join(',') || ''
			})
		} catch (e) {
			console.error('[Salesforce] Error on purchase', e)
		}
	}

	/**
	 * Registra quando um item é removido do carrinho.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#remove_from_cart
	 */
	static removeFromCartEvent = async (cart: VtexCart, index: number): Promise<void> => {
		const itemRemoved = cart.items[index]

		try {
			const itemRemoved = cart.items[index]
			const item = this._resolveGACartItemMetadata(itemRemoved)

			const params = {
				currency: 'BRL',
				value: item.price,
				items: [item]
			}

			TrackingService.sendRecommendedGaEvent('remove_from_cart', params)
		} catch (e) {
			console.error('Error on analytics removeItemFromCart', e)
		}

		// Insider
		try {
			const payload = {
				productID: itemRemoved?.productId
			}
			this._logInTerminal('insider', 'itemAddedToCart', payload)
			Eitri.exposedApis.insider.itemRemovedFromCart(payload)
		} catch (error) {
			console.error(error, 'insider.itemRemovedFromCart')
		}

		// Salesforce
		try {
			const cartItem = this._resolveGACartItemMetadata(itemRemoved)
			TrackingService.sendSalesforceEvent('remove_from_cart', {
				currency: 'BRL',
				value: cartItem.price || 0,
				item_id: cartItem.item_id || '',
				item_name: cartItem.item_name || '',
				quantity: cartItem.quantity || 1
			})
		} catch (e) {
			console.error('[Salesforce] Error on remove_from_cart', e)
		}
	}

	/**
	 * Registra uma busca realizada pelo usuário.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#search
	 */
	static searchEvent = async (term: string): Promise<void> => {
		TrackingService.sendRecommendedGaEvent('search', { search_term: term })

		// Salesforce
		TrackingService.sendSalesforceEvent('search', { search_term: term || '' })
	}

	/**
	 * Registra quando o usuário seleciona um conteúdo.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#select_content
	 */
	static selectContentEvent = async (data: Record<string, unknown>): Promise<void> => {
		TrackingService.sendRecommendedGaEvent('select_content', data)
		TrackingService.sendSalesforceEvent('select_content', TrackingService._flattenForSalesforce(data))
	}

	/**
	 * Registra quando o usuário seleciona um item.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#select_item
	 */
	static selectItemEvent = async (data: Record<string, unknown>): Promise<void> => {
		TrackingService.sendRecommendedGaEvent('select_item', data)
		TrackingService.sendSalesforceEvent('select_item', TrackingService._flattenForSalesforce(data))
	}

	/**
	 * Registra quando o usuário seleciona uma promoção.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#select_promotion
	 */
	static selectPromotionEvent = async (data: Record<string, unknown>): Promise<void> => {
		try {
			TrackingService.sendRecommendedGaEvent('select_promotion', data)
			TrackingService.sendSalesforceEvent('select_promotion', TrackingService._flattenForSalesforce(data))
		} catch (e) {}
	}

	/**
	 * Registra quando o usuário compartilha conteúdo.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#share
	 */
	static shareEvent = async (itemId: string): Promise<void> => {
		TrackingService.sendRecommendedGaEvent('share', { item_id: itemId })

		// Salesforce
		TrackingService.sendSalesforceEvent('share', { item_id: itemId || '' })
	}

	/**
	 * Registra quando o usuário cria conta (signup).
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#sign_up
	 */
	static signUpEvent = async (data: { method?: string; [key: string]: unknown }): Promise<void> => {
		TrackingService.sendRecommendedGaEvent('sign_up', data)

		// Salesforce
		try {
			const sfData: SalesforceEventData = {}
			if (data?.method) sfData.method = data.method
			TrackingService.sendSalesforceEvent('sign_up', sfData)
		} catch (e) {
			console.error('[Salesforce] Error on sign_up', e)
		}
	}

	/**
	 * Registra visualização do carrinho.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#view_cart
	 */
	static viewCartEvent = async (cart: VtexCart): Promise<void> => {
		// GA
		const items = cart.items.map(item => this._resolveGACartItemMetadata(item))
		const totalizer = cart?.totalizers?.find(i => i.id === 'Items')
		const value = totalizer?.value ? totalizer.value / 100 : cart.value ? cart.value / 100 : ''

		const payload = {
			currency: 'BRL',
			value: value,
			items: items
		}
		this.sendRecommendedGaEvent('view_cart', payload)

		// Insider
		try {
			const insiderPayload = []
			for (const item of cart.items) {
				insiderPayload.push({
					productID: item.productId,
					name: item.name,
					// productCategories can be missing; Object.values(undefined) throws.
					taxonomy: Object.values(item.productCategories ?? {}),
					imageURL: item.imageUrl,
					price: Number(item.price) / 100,
					quantity: item.quantity,
					currency: 'BRL'
				})
			}
			this._logInTerminal('insider', 'visitCartPage', { products: insiderPayload })
			Eitri.exposedApis.insider.visitCartPage({
				products: insiderPayload
			})
		} catch (e) {
			console.error('insider.visitCartPage', e)
		}

		// Salesforce
		try {
			const sfTotalizer = cart?.totalizers?.find(i => i.id === 'Items')
			const sfValue = sfTotalizer?.value ? sfTotalizer.value / 100 : cart.value ? cart.value / 100 : 0
			TrackingService.sendSalesforceEvent('view_cart', {
				currency: 'BRL',
				value: sfValue,
				items_count: cart.items?.length || 0,
				item_ids: cart.items?.map(i => i.productId).join(',') || ''
			})
		} catch (e) {
			console.error('[Salesforce] Error on view_cart', e)
		}
	}

	/**
	 * Registra visualização de item/produto.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#view_item
	 */
	static viewItemEvent = async (product: VtexProduct): Promise<void> => {
		const item = this._resolveGAProductMetadata(product)

		// GA
		try {
			const data = {
				currency: 'BRL',
				value: item?.price,
				items: [item]
			}
			this.sendRecommendedGaEvent('view_item', data)
		} catch (error) {
			console.error('Erro ao montar log de produto', error)
		}

		// Insider
		try {
			const productMetadata = this._resolveInsiderProductMetadata(product)
			const payload = {
				product: productMetadata
			}
			this._logInTerminal('insider', 'visitProductPage', payload)
			Eitri.exposedApis.insider.visitProductDetailPage(payload)
		} catch (e) {
			console.error('insiderVisitProductPage', e)
		}

		// Salesforce
		try {
			TrackingService.sendSalesforceEvent('view_item', {
				currency: 'BRL',
				value: item.price || 0,
				item_id: item.item_id || '',
				item_name: item.item_name || '',
				item_brand: item.item_brand || ''
			})
		} catch (e) {
			console.error('[Salesforce] Error on view_item', e)
		}
	}

	/**
	 * Registra visualização de lista de itens.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#view_item_list
	 */
	static viewItemListEvent = async (data: Record<string, unknown>): Promise<void> => {
		TrackingService.sendRecommendedGaEvent('view_item_list', data)
		TrackingService.sendSalesforceEvent('view_item_list', TrackingService._flattenForSalesforce(data))
	}

	/**
	 * Registra visualização de promoção.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#view_promotion
	 */
	static viewPromotionEvent = async (data: Record<string, unknown>): Promise<void> => {
		TrackingService.sendRecommendedGaEvent('view_promotion', data)
		TrackingService.sendSalesforceEvent('view_promotion', TrackingService._flattenForSalesforce(data))
	}

	/**
	 * Registra visualização de resultados de busca.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#view_search_results
	 */
	static viewSearchResultsEvent = async (data: Record<string, unknown>): Promise<void> => {
		TrackingService.sendRecommendedGaEvent('view_search_results', data)
		TrackingService.sendSalesforceEvent('view_search_results', TrackingService._flattenForSalesforce(data))
	}
}
