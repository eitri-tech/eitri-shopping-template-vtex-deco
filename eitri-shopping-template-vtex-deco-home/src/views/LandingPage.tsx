import { useState, useEffect } from 'react'
import { Page, View } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import {
	Loading,
	HeaderContentWrapper,
	HeaderReturn,
	HeaderText,
	HeaderSearchIcon,
	TrackingService,
	BottomInset
} from 'eitri-shopping-template-vtex-deco-shared'
import { getCmsContent } from '../services/CmsService'
import CmsContentRender from '../components/CmsContentRender/CmsContentRender'
import type { CmsSection } from '../types/vtex'
import type { RouteProps } from '../types/route'

interface LandingPageState {
	title?: string
	openInBottomBar?: boolean
	landingPageName?: string
}

export default function LandingPage(props: RouteProps<LandingPageState>) {
	const [cmsContent, setCmsContent] = useState<CmsSection[] | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const pageTitle = props?.location?.state?.title ?? ''
	const openInBottomBar = !!props?.location?.state?.openInBottomBar

	useEffect(() => {
		loadCms()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const loadCms = async () => {
		try {
			const landingPageName = props?.location?.state?.landingPageName
			const result = await getCmsContent('landingPage', landingPageName)
			setCmsContent(result?.sections ?? [])
			setIsLoading(false)
			TrackingService.sendScreenView(landingPageName ?? '', 'LandingPage')
		} catch (e) {
			setIsLoading(false)
		}
	}

	const handleSearch = (term: string) => {
		Eitri.keyboard.dismiss()
		Eitri.navigation.navigate({ path: 'Search', state: { searchTerm: term } })
	}

	return (
		<Page title={props?.location?.state?.landingPageName ?? 'Landing Page'}>
			<HeaderContentWrapper className={`justify-between`}>
				<View className={`flex items-center gap-4`}>
					{!openInBottomBar && <HeaderReturn />}
					<HeaderText text={pageTitle} />
				</View>

				<HeaderSearchIcon onClick={() => Eitri.navigation.navigate({ path: 'Search' })} />
			</HeaderContentWrapper>

			<Loading
				fullScreen
				isLoading={isLoading}
			/>
			<CmsContentRender
				className={'pt-4'}
				cmsContent={cmsContent ?? undefined}
			/>

			<BottomInset />
		</Page>
	)
}
