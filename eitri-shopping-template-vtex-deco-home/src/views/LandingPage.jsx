import Eitri from 'eitri-bifrost'
import {
	Loading,
	HeaderContentWrapper,
	HeaderReturn,
	HeaderText,
	HeaderSearchIcon,
	TrackingService,
	BottomInset,
	useRetractableBottomBar
} from 'eitri-shopping-template-vtex-deco-shared'
import { getCmsContent } from '../services/CmsService'
import CmsContentRender from '../components/CmsContentRender/CmsContentRender'

export default function LandingPage(props) {
	useRetractableBottomBar()
	const [cmsContent, setCmsContent] = useState(null)
	const [isLoading, setIsLoading] = useState(true)
	const pageTitle = props?.location?.state?.title ?? ''
	const openInBottomBar = !!props?.location?.state?.openInBottomBar

	useEffect(() => {
		loadCms()
	}, [])

	const loadCms = async () => {
		try {
			const landingPageName = props?.location?.state?.landingPageName
			const { sections } = await getCmsContent('landingPage', landingPageName)
			setCmsContent(sections)
			setIsLoading(false)
			TrackingService.sendScreenView(landingPageName, 'LandingPage')
		} catch (e) {
			setIsLoading(false)
		}
	}

	const handleSearch = term => {
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
				cmsContent={cmsContent}
			/>

			<BottomInset />
		</Page>
	)
}
