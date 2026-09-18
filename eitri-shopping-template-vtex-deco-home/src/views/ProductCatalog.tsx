import { useState, useEffect } from 'react'
import { Page, View } from 'eitri-luminus'
import {
	HeaderContentWrapper,
	HeaderReturn,
	HeaderText,
	HeaderSearchIcon,
	TrackingService,
	BottomInset
} from 'eitri-shopping-template-vtex-deco-shared'

import Eitri from 'eitri-bifrost'
import { useTranslation } from 'eitri-i18n'
import ProductCatalogContent from '../components/ProductCatalogContent/ProductCatalogContent'
import type { RouteProps } from '../types/route'

interface ProductCatalogParams {
	facets?: Array<{ key: string; value: string }>
	query?: string
	sort?: string
	[key: string]: unknown
}

interface ProductCatalogState {
	title?: string
	openInBottomBar?: boolean
	showTitle?: boolean
	params?: ProductCatalogParams
	banner?: string
}

export default function ProductCatalog(props: RouteProps<ProductCatalogState>) {
	const { location } = props
	const { t } = useTranslation()

	const title = location?.state?.title
	const openInBottomBar = !!location?.state?.openInBottomBar

	const [appliedFacets, setAppliedFacets] = useState<ProductCatalogParams | null>(null)

	useEffect(() => {
		const params = location?.state?.params
		setAppliedFacets(params ?? null)

		if (!openInBottomBar) {
			// eventBus.subscribe's own docs say custom string channels are supported, but the .d.ts
			// only types `channel` as the EventBusCommonEvents enum — cast to keep this custom channel
			// (same pattern already established in account/src/utils/backToTopListener.ts).
			Eitri.eventBus.subscribe({
				channel: 'onUserTappedActiveTab' as any,
				callback: _ => {
					Eitri.navigation.back(1)
				}
			})
		}

		TrackingService.sendScreenView('Catálogo de produtos', 'ProductCatalog')
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<Page title={title || t('productCatalog.title')}>
			<>
				<HeaderContentWrapper className={`justify-between`}>
					<View className={`flex items-center gap-4`}>
						{!openInBottomBar && <HeaderReturn />}
						<HeaderText text={title} />
					</View>

					<HeaderSearchIcon onClick={() => Eitri.navigation.navigate({ path: 'Search' })} />
				</HeaderContentWrapper>

				{appliedFacets && (
					<ProductCatalogContent
						banner={location?.state?.banner}
						params={appliedFacets}
						showFilters={true}
					/>
				)}

				<BottomInset />
			</>
		</Page>
	)
}
