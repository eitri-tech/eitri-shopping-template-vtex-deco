import Eitri from 'eitri-bifrost'
import { useLocalShoppingCart } from '../providers/LocalCart'
import { getCmsContent } from '../services/CmsService'
import { startConfigure } from '../services/AppService'
import HomeSkeleton from '../components/HomeSkeleton/HomeSkeleton'
import CmsContentRender from '../components/CmsContentRender/CmsContentRender'
import MainHeader from '../components/Header/MainHeader'
import { BottomInset, TrackingService, Loading } from 'eitri-shopping-template-vtex-deco-shared'
import { useQuery } from '@tanstack/react-query'

export default function Home() {
	const { startCart } = useLocalShoppingCart()
	const [enableCmsQuery, setEnableCmsQuery] = useState(false)
	const [initialLoading, setInitialLoading] = useState(true)

	useEffect(() => {
		startHome()
		requestNotificationPermission()
		Eitri.navigation.addOnResumeListener(() => {
			startCart()
		})
	}, [])

	const { data: cmsContent } = useQuery({
		queryKey: ['cms', 'home'],
		queryFn: async () => {
			const { sections } = await getCmsContent('home', 'home')
			return sections
		},
		enabled: enableCmsQuery
	})

	const requestNotificationPermission = async () => {
		try {
			let notificationPermissionStatus = await Eitri.notification.checkPermission()
			if (notificationPermissionStatus.status === 'DENIED') {
				await Eitri.notification.requestPermission()
			}
		} catch (e) {
			console.error('Erro ao solicitar permissão para notificação', e)
		}
	}

	const startHome = async () => {
		const startParams = await Eitri.getInitializationInfos()
		if (!startParams?.route) {
			setInitialLoading(false)
		}

		startConfigure()
			.then(resolveRedirectAndCartAndCms)
			.catch(e => {
				console.error('Erro startConfigure: ', e)
			})
	}

	const resolveRedirectAndCartAndCms = async () => {
		const startParams = await Eitri.getInitializationInfos()
		if (startParams) {
			const openRoute = processDeepLink(startParams)
			if (openRoute) {
				Eitri.navigation.navigate(openRoute)
				return
			}
		}
		setEnableCmsQuery(true)
		startCart()
		TrackingService.sendScreenView('Página inicial', 'Home')
		TrackingService.insiderVisitHomepage()
	}

	const processDeepLink = startParams => {
		if (startParams?.route) {
			let { route, ...rest } = startParams
			return {
				path: route,
				state: rest,
				replace: true
			}
		}
	}

	if (initialLoading) {
		return <Loading fullScreen />
	}

	return (
		<Page
			title='Página inicial'
			topInset>
			<MainHeader />
			<View>
				<HomeSkeleton show={!cmsContent} />
				<CmsContentRender cmsContent={cmsContent} />
				<BottomInset />
			</View>
		</Page>
	)
}
