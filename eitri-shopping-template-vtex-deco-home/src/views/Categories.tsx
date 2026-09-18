import { useState, useEffect, ReactNode } from 'react'
import { Page } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import {
	Loading,
	HeaderContentWrapper,
	HeaderSearchIcon,
	BottomInset,
	TrackingService
} from 'eitri-shopping-template-vtex-deco-shared'
import { getCmsContent } from '../services/CmsService'
import CmsContentRender from '../components/CmsContentRender/CmsContentRender'
import type { CmsSection } from '../types/vtex'

export default function Categories() {
	const [cmsContent, setCmsContent] = useState<CmsSection[] | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [pageTitle, setPageTitle] = useState<ReactNode>(null)

	useEffect(() => {
		loadCms()
		Eitri.navigation.addOnResumeListener(() => {
			TrackingService.sendScreenView('Categorias', 'Categories')
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const loadCms = async () => {
		const result = await getCmsContent('categories', 'categorias')
		setCmsContent(result?.sections ?? [])
		setIsLoading(false)
	}

	const goToSearch = () => {
		Eitri.navigation.navigate({
			path: '/Search'
		})
	}

	return (
		<Page title='Categorias'>
			<HeaderContentWrapper className='justify-between'>
				{pageTitle}
				<HeaderSearchIcon onClick={goToSearch} />
			</HeaderContentWrapper>

			<Loading
				fullScreen
				isLoading={isLoading}
			/>

			<CmsContentRender
				cmsContent={cmsContent ?? undefined}
				setPageTitle={setPageTitle}
			/>

			<BottomInset />
		</Page>
	)
}
