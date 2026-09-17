import {
	Loading,
	HeaderContentWrapper,
	HeaderText,
	HeaderReturn,
	BottomInset,
	GenericBox,
	useRetractableBottomBar
} from 'eitri-shopping-template-vtex-deco-shared'
import NoItem from '../components/NoItem/NoItem'
import { sendScreenView } from '../services/TrackingService'
import { useTranslation } from 'eitri-i18n'
import OrderCard from '../components/OrderCard/OrderCard'
import { listOrders } from '../services/CustomerService'
import ProtectedView from '../components/ProtectedView/ProtectedView'
import InfiniteScroll from '../components/InfiniteScroll/InfiniteScroll'
import { addonUserTappedActiveTabListener } from '../utils/backToTopListener'
import SnackBarComponent from '../providers/SnackBar'

export default function OrderList(props) {
	const { t } = useTranslation()
	useRetractableBottomBar()
	const [orders, setOrders] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [pageHasEnded, setPageHasEnded] = useState(false)

	const pageRef = useRef(1)
	const maxPages = useRef(Infinity)
	const isFetchingRef = useRef(false)

	useEffect(() => {
		handleOrders()
		addonUserTappedActiveTabListener()
		sendScreenView('Meus Pedidos', 'OrderList')
	}, [])

	useEffect(() => {
		isFetchingRef.current = false
	}, [orders])

	const handleOrders = async () => {
		try {
			if (isFetchingRef.current || pageHasEnded || pageRef.current > maxPages.current) {
				return
			}
			isFetchingRef.current = true
			setIsLoading(true)
			const result = await listOrders(pageRef.current)
			maxPages.current = result?.paging?.pages
			if (!result?.list?.length) {
				setPageHasEnded(true)
				return
			}
			setOrders(prev => [...prev, ...result.list])
			pageRef.current += 1
		} catch (error) {
			console.log('erro ao buscar orders', error)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<ProtectedView afterLoginRedirectTo={'OrderList'}>
			<Page title='Meus Pedidos'>
				<HeaderContentWrapper>
					<HeaderReturn />
					<HeaderText text={t('orderList.title')} />
				</HeaderContentWrapper>

				<View className='p-4'>
					{orders.length >= 1 ? (
						<InfiniteScroll
							onScrollEnd={handleOrders}
							className={'flex flex-col gap-4'}>
							{orders.map(item => (
								<OrderCard
									key={item.orderId}
									order={item}
								/>
							))}
							{isLoading && (
								<View className='flex justify-center py-4'>
									<Loading isLoading={true} />
								</View>
							)}
						</InfiniteScroll>
					) : isLoading ? (
						<Loading
							isLoading={true}
							fullScreen
						/>
					) : (
						<NoItem
							title={t('orderList.emptyTitle')}
							subtitle={t('orderList.emptySubtitle')}
						/>
					)}
				</View>
				<BottomInset />
			</Page>
		</ProtectedView>
	)
}
