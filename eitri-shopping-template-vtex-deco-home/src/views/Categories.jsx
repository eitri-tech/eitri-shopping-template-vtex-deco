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

export default function Categories() {
	const [cmsContent, setCmsContent] = useState(null)
	const [isLoading, setIsLoading] = useState(true)
	const [pageTitle, setPageTitle] = useState(null)

	useEffect(() => {
		loadCms()
		Eitri.navigation.addOnResumeListener(() => {
			TrackingService.sendScreenView('Categorias', 'Categories')
		})
	}, [])

	const loadCms = async () => {
		const { sections } = await getCmsContent('categories', 'categorias')
		setCmsContent(sections)
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
				cmsContent={cmsContent}
				setPageTitle={setPageTitle}
			/>

			<BottomInset />
		</Page>
	)
}
