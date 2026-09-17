import { useState, useEffect } from 'react'
import { Page, View, Text } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import { HeaderContentWrapper, HeaderText, HeaderReturn, BottomInset, Loading } from 'eitri-shopping-template-vtex-deco-shared'
import ProtectedView from '../components/ProtectedView/ProtectedView'
import NoItem from '../components/NoItem/NoItem'
import SubscriptionCard from '../components/SubscriptionCard/SubscriptionCard'
import SubscriptionRenameModal from '../components/SubscriptionRenameModal/SubscriptionRenameModal'
import { listSubscriptions, updateSubscription } from '../services/SubscriptionService'
import { loadSkuProducts } from '../services/ProductService'
import { sendScreenView } from '../services/TrackingService'
import { addonUserTappedActiveTabListener } from '../utils/backToTopListener'
import { STATUS_OPTIONS } from '../utils/subscription'
import { useSnackBar } from '../providers/SnackBar'
import { useTranslation } from 'eitri-i18n'
import type { VtexSubscription } from '../types/vtex'

interface SubscriptionProductEntry {
	name?: string
	imageUrl?: string
}

export default function Subscriptions() {
	const { t } = useTranslation()
	const { showSnackBar } = useSnackBar()

	const [status, setStatus] = useState('ACTIVE')
	const [subscriptions, setSubscriptions] = useState<VtexSubscription[]>([])
	const [products, setProducts] = useState<Record<string, SubscriptionProductEntry | null>>({})
	const [isLoading, setIsLoading] = useState(true)
	const [renaming, setRenaming] = useState<VtexSubscription | null>(null)
	const [isSaving, setIsSaving] = useState(false)

	useEffect(() => {
		addonUserTappedActiveTabListener()
		sendScreenView('Minhas Assinaturas', 'Subscriptions')
		Eitri.navigation.setOnResumeListener(() => load(status))
	}, [])

	useEffect(() => {
		load(status)
	}, [status])

	const load = async (currentStatus: string) => {
		setIsLoading(true)
		try {
			const result = (await listSubscriptions(currentStatus)) as VtexSubscription[] | undefined
			const list = result || []
			setSubscriptions(list)
			const skuIds = list.flatMap(subscription => (subscription.items ?? []).map(item => item.skuId ?? ''))
			const missing = skuIds.filter(skuId => skuId && !products[skuId])
			if (missing.length) {
				const loaded = await loadSkuProducts(missing)
				setProducts(prev => ({ ...prev, ...loaded }))
			}
		} catch (e) {
			console.error('listSubscriptions error', e)
			setSubscriptions([])
		} finally {
			setIsLoading(false)
		}
	}

	const saveTitle = async (title: string) => {
		if (!renaming?.id) return
		setIsSaving(true)
		try {
			await updateSubscription(renaming.id, { title })
			setSubscriptions(prev => prev.map(item => (item.id === renaming.id ? { ...item, title } : item)))
			setRenaming(null)
			showSnackBar?.('success', t('subscriptions.saved'))
		} catch (e) {
			console.error('updateSubscription title error', e)
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<ProtectedView afterLoginRedirectTo={'Subscriptions'}>
			<Page title='Minhas Assinaturas'>
				<HeaderContentWrapper>
					<HeaderReturn />
					<HeaderText text={t('subscriptions.title')} />
				</HeaderContentWrapper>

				<View className='flex flex-row gap-2 px-4 pt-4'>
					{STATUS_OPTIONS.map(option => {
						const selected = option === status
						return (
							<View
								key={option}
								className={`px-4 py-2 rounded-full border ${selected ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}
								onClick={() => setStatus(option)}>
								<Text
									className={`text-sm font-semibold ${selected ? 'text-primary-content' : 'text-gray-700'}`}>
									{t(`subscriptions.filter.${option}`)}
								</Text>
							</View>
						)
					})}
				</View>

				<View className='p-4'>
					{isLoading ? (
						<Loading
							isLoading={true}
							fullScreen
						/>
					) : subscriptions.length === 0 ? (
						<NoItem
							title={t('subscriptions.emptyTitle')}
							subtitle={t('subscriptions.emptySubtitle')}
						/>
					) : (
						<View className='flex flex-col gap-4'>
							{subscriptions.map(subscription => (
								<SubscriptionCard
									key={subscription.id}
									subscription={subscription}
									products={products as Record<string, { imageUrl?: string; name?: string }>}
									onRename={() => setRenaming(subscription)}
								/>
							))}
						</View>
					)}
				</View>

				<SubscriptionRenameModal
					show={!!renaming}
					initialTitle={renaming?.title}
					isSaving={isSaving}
					onSave={saveTitle}
					onClose={() => setRenaming(null)}
				/>

				<BottomInset />
			</Page>
		</ProtectedView>
	)
}
