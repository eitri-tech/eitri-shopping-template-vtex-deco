import Eitri from 'eitri-bifrost'

export default class TrackingService {
	static _logInTerminal = (...args) => {
		const TURNED_ON = false
		if (!TURNED_ON) return
		console.log('[TRACKING]', ...args)
	}

	static _resolveCategory = item => {
		let ids =
			item.productCategoryIds?.split('/').filter(Boolean) || item.categoriesIds[0]?.split('/').filter(Boolean)
		let categories = item.productCategories || item.categories[0]?.split('/').filter(Boolean)
		let result = {}

		ids.forEach((id, index) => {
			const key = index === 0 ? 'item_category' : `item_category${index + 1}`
			result[key] = item.productCategories ? categories[id] : categories[index]
		})

		return result
	}

	static _resolveInsiderProductMetadata = product => {
		const availableSku = product.items.find(item =>
			item.sellers.some(seller => seller.commertialOffer?.AvailableQuantity > 0)
		)
		const mainSeller = availableSku?.sellers.find(seller => seller.sellerDefault) || availableSku?.sellers[0]

		return {
			productID: product?.productId,
			name: product?.productName,
			taxonomy: product?.categoryTree?.map(i => i.name) || [],
			imageURL: product?.items?.[0]?.images?.[0]?.imageUrl || '',
			price: mainSeller?.commertialOffer?.Price || 0,
			currency: 'BRL'
		}
	}

	static _resolveGAProductMetadata = product => {
		const categories = product?.categoryTree?.reduce((acc, curr, index) => {
			if (index === 0) {
				acc[`item_category`] = curr.name
			} else {
				acc[`item_category${index + 1}`] = curr.name
			}
			return acc
		}, {})

		const availableSku = product.items.find(item =>
			item.sellers.some(seller => seller.commertialOffer?.AvailableQuantity > 0)
		)
		const mainSeller = availableSku?.sellers.find(seller => seller.sellerDefault) || availableSku?.sellers[0]

		return {
			item_id: product.productId,
			item_name: product.productName,
			item_brand: product.brand || '',
			...categories,
			price: mainSeller?.commertialOffer?.Price
		}
	}

	static _resolveGACartItemMetadata = item => {
		const categories = Object.values(item?.productCategories)?.reduce((acc, curr, index) => {
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
			item_brand: item.additionalInfo.brandName || '',
			...categories,
			price: item?.priceDefinition?.calculatedSellingPrice / 100,
			quantity: item.quantity
		}
	}

	static sendScreenView = async (friendlyScreenName, screenFilename) => {
		Eitri.exposedApis.fb.currentScreen({ screen: friendlyScreenName, screenClass: screenFilename })
	}

	static insiderVisitHomepage = async () => {
		Eitri.exposedApis.insider.visitHomepage()
	}

	static sendRecommendedGaEvent = async (eventName, data = {}) => {
		await Eitri.exposedApis.fb.logEvent({ eventName, data })
		this._logInTerminal('GA', eventName, data)
	}

	/**
	 * Registra quando um anúncio é exibido para o usuário.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#ad_impression
	 */
	static adImpressionEvent = async data => TrackingService.sendRecommendedGaEvent('ad_impression', data)

	/**
	 * Registra quando o usuário envia dados de pagamento no checkout.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#add_payment_info
	 */
	static addPaymentInfoEvent = async (cart, paymentType) => {
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
		} catch (e) {
			console.log('Error on trackAddPaymentInfo', e)
		}
	}

	/**
	 * Registra quando o usuário envia dados de frete no checkout.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#add_shipping_info
	 */
	static addShippingInfoEvent = async cart => {
		try {
			const items = cart.items.map(item => {
				const categories = TrackingService._resolveCategory(item)

				return {
					item_id: item.id,
					item_name: item.name,
					item_brand: item.additionalInfo?.brandName,
					...categories,
					price: item.sellingPrice / 100,
					quantity: item.quantity
				}
			})

			let shippingSelected = cart?.shippingData?.logisticsInfo?.map(item => item.selectedSla)
			const uniqueSla = [...new Set(shippingSelected)]

			const totalItemPrice = cart.totalizers.find(item => item.id === 'Items')?.value / 100

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
	}

	/**
	 * Registra quando um item é adicionado ao carrinho.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#add_to_cart
	 */
	static addToCartEvent = async product => {
		// GA
		try {
			const item = this._resolveGAProductMetadata(product)

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
	}

	/**
	 * Registra quando um item é adicionado à lista de desejos.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#add_to_wishlist
	 */
	static addToWishlistEvent = async data => TrackingService.sendRecommendedGaEvent('add_to_wishlist', data)

	/**
	 * Registra quando o usuário inicia o checkout.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#begin_checkout
	 */
	static beginCheckoutEvent = async cart => {
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
	}

	/**
	 * Registra quando o usuário faz login.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#login
	 */
	static loginEvent = async method => {
		// GA
		TrackingService.sendRecommendedGaEvent('login', { method })

		// Insider
		Eitri.exposedApis.insider.signUpConfirmation()
	}

	/**
	 * Registra uma compra concluída.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#purchase
	 */
	static purchaseEvent = async (cart, orderId) => {
		// GA
		try {
			const items = cart.items.map(item => {
				const categories = TrackingService._resolveCategory(item)

				return {
					item_id: item.id,
					item_name: item.name,
					item_brand: item.additionalInfo?.brandName,
					...categories,
					price: item.sellingPrice / 100,
					quantity: item.quantity
				}
			})

			// const totalItemPrice = cart.totalizers.find(item => item.id === 'Items')?.value / 100
			const shippingPrice = cart.totalizers.find(item => item.id === 'Shipping')?.value / 100

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
							taxonomy: Object.values(item.productCategories),
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
	}

	/**
	 * Registra quando um item é removido do carrinho.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#remove_from_cart
	 */
	static removeFromCartEvent = async (cart, index) => {
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
	}

	/**
	 * Registra uma busca realizada pelo usuário.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#search
	 */
	static searchEvent = async term => {
		TrackingService.sendRecommendedGaEvent('search', {
			search_term: term
		})
	}

	/**
	 * Registra quando o usuário seleciona um conteúdo.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#select_content
	 */
	static selectContentEvent = async data => TrackingService.sendRecommendedGaEvent('select_content', data)

	/**
	 * Registra quando o usuário seleciona um item.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#select_item
	 */
	static selectItemEvent = async data => TrackingService.sendRecommendedGaEvent('select_item', data)

	/**
	 * Registra quando o usuário seleciona uma promoção.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#select_promotion
	 */
	static selectPromotionEvent = async data => {
		try {
			TrackingService.sendRecommendedGaEvent('select_promotion', data)
		} catch (e) {}
	}

	/**
	 * Registra quando o usuário compartilha conteúdo.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#share
	 */
	static shareEvent = async itemId => {
		TrackingService.sendRecommendedGaEvent('share', {
			item_id: itemId
		})
	}

	/**
	 * Registra quando o usuário cria conta (signup).
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#sign_up
	 */
	static signUpEvent = async data => TrackingService.sendRecommendedGaEvent('sign_up', data)

	/**
	 * Registra visualização do carrinho.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#view_cart
	 */
	static viewCartEvent = async cart => {
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
					taxonomy: Object.values(item.productCategories),
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
	}

	/**
	 * Registra visualização de item/produto.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#view_item
	 */
	static viewItemEvent = async product => {
		// GA
		try {
			const item = this._resolveGAProductMetadata(product)
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
	}

	/**
	 * Registra visualização de lista de itens.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#view_item_list
	 */
	static viewItemListEvent = async data => TrackingService.sendRecommendedGaEvent('view_item_list', data)

	/**
	 * Registra visualização de promoção.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#view_promotion
	 */
	static viewPromotionEvent = async data => TrackingService.sendRecommendedGaEvent('view_promotion', data)

	/**
	 * Registra visualização de resultados de busca.
	 * Docs: https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#view_search_results
	 */
	static viewSearchResultsEvent = async data => TrackingService.sendRecommendedGaEvent('view_search_results', data)
}
