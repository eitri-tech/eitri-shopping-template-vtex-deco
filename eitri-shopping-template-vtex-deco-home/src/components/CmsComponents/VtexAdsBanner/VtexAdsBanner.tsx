import { View, Image } from 'eitri-luminus'
import { useState, useEffect, useRef } from 'react'
import Eitri from 'eitri-bifrost'
import { getSponsoredBanner } from '../../../services/VtexAdsService'
import { processActions } from '../../../services/ResolveCmsActions'

// getSponsoredBanner's SponsoredAd type (VtexAdsService.ts, not exported) only models the fields
// that service itself sets — term/facets aren't part of a VTEX Ads response, but this renderer
// also doubles as a generic "collection banner" that reads them when present (mirrors the CMS
// banner action shape used elsewhere, e.g. ResolveCmsActions.ts's CmsAction).
interface AdsBanner {
	adId: string
	imageUrl: string
	destinationUrl?: string
	clickUrl?: string
	impressionUrl?: string
	viewUrl?: string
	term?: string
	facets?: Array<{ key: string; value: string }>
}

interface VtexAdsBannerData {
	isActive?: boolean
	sponsoredPlacement: string
	keyword?: string
	size?: unknown
	context?: unknown
	quantity?: number
}

const fireBeacon = (url?: string) => {
	if (!url) return
	Eitri.http.get(url).catch(() => {})
}

interface BannerItemProps {
	banner: AdsBanner
}

function BannerItem(props: BannerItemProps) {
	const { banner } = props
	const viewFired = useRef(false)
	const itemId = useRef(`vtex-ads-banner-${Math.random().toString(36).slice(2)}`)

	useEffect(() => {
		const el = document.getElementById(itemId.current)
		if (!el) return

		const observer = new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting && !viewFired.current) {
					viewFired.current = true
					fireBeacon(banner.viewUrl)
					observer.disconnect()
				}
			},
			{ threshold: 0.5 }
		)

		observer.observe(el)
		return () => observer.disconnect()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleClick = () => {
		fireBeacon(banner.clickUrl)
		if (banner.term || banner.facets) {
			Eitri.navigation.navigate({
				path: 'ProductCatalog',
				state: {
					params: {
						facets: banner.facets || [],
						query: banner.term || ''
					},
					banner: banner.imageUrl || ''
				}
			})
		}
		if (banner.destinationUrl) {
			const url = new URL(banner.destinationUrl)
			const pathWithQuery = url.pathname + url.search
			processActions({ action: { type: 'path', value: pathWithQuery } })
		}
	}

	return (
		<View
			id={itemId.current}
			className='px-4'
			onClick={handleClick}>
			<Image
				src={banner.imageUrl}
				className='w-full h-auto rounded'
			/>
		</View>
	)
}

interface VtexAdsBannerProps {
	data?: VtexAdsBannerData
}

export default function VtexAdsBanner(props: VtexAdsBannerProps) {
	const { data } = props
	const [banners, setBanners] = useState<AdsBanner[]>([])

	useEffect(() => {
		if (!data?.isActive) return
		loadBanners()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const loadBanners = async () => {
		try {
			if (!data) return
			const result = (await getSponsoredBanner({
				sponsoredPlacement: data.sponsoredPlacement,
				keyword: data.keyword,
				size: data.size,
				context: data.context || 'home',
				quantity: data.quantity
			})) as AdsBanner[] | null
			if (!result?.length) return
			setBanners(result)
			result.forEach(banner => fireBeacon(banner.impressionUrl))
		} catch (e) {
			console.error('VtexAdsBanner: erro ao carregar banners', e)
		}
	}

	if (!data?.isActive || !banners.length) return null

	return (
		<View className='flex flex-col gap-3'>
			{banners.map(banner => (
				<BannerItem
					key={banner.adId}
					banner={banner}
				/>
			))}
		</View>
	)
}
