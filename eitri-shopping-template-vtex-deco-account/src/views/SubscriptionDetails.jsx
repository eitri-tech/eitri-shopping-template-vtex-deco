import {
	HeaderContentWrapper,
	HeaderText,
	HeaderReturn,
	BottomInset,
	Loading,
	GenericBox,
	CustomButton
} from 'eitri-shopping-template-vtex-deco-shared'
import { FiEdit2, FiClock, FiTrash2, FiMinus, FiPlus, FiChevronDown, FiCreditCard, FiPackage } from 'react-icons/fi'
import ProtectedView from '../components/ProtectedView/ProtectedView'
import ModalConfirm from '../components/ModalConfirm/ModalConfirm'
import OptionPicker from '../components/OptionPicker/OptionPicker'
import SubscriptionRenameModal from '../components/SubscriptionRenameModal/SubscriptionRenameModal'
import SubscriptionHistoryModal from '../components/SubscriptionHistoryModal/SubscriptionHistoryModal'
import SubscriptionStatusBadge from '../components/SubscriptionStatusBadge/SubscriptionStatusBadge'
import { useSnackBar } from '../providers/SnackBar'
import {
	getSubscription,
	updateSubscription,
	updateSubscriptionItem,
	removeSubscriptionItem,
	simulateSubscription
} from '../services/SubscriptionService'
import { loadSkuProducts } from '../services/ProductService'
import { getSavedCards } from '../services/CustomerService'
import { getAddresses } from '../services/AddressService'
import { sendScreenView } from '../services/TrackingService'
import { formatDateDaysMonthYear, formatPrice, formatPriceInCents } from '../utils/utils'
import {
	STATUS_OPTIONS,
	frequencyKey,
	frequencyLabel,
	parseFrequencyOptions,
	subscriptionTitle
} from '../utils/subscription'
import { useTranslation } from 'eitri-i18n'

export default function SubscriptionDetails(props) {
	const { subscriptionId } = props.location.state
	const { t } = useTranslation()
	const { showSnackBar } = useSnackBar()

	const [subscription, setSubscription] = useState(null)
	const [products, setProducts] = useState({})
	const [simulation, setSimulation] = useState(null)
	const [cards, setCards] = useState([])
	const [addresses, setAddresses] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [isSaving, setIsSaving] = useState(false)

	const [editingItems, setEditingItems] = useState(null)
	const [editingPrefs, setEditingPrefs] = useState(null)
	const [picker, setPicker] = useState(null)
	const [showRename, setShowRename] = useState(false)
	const [showHistory, setShowHistory] = useState(false)
	const [showCancel, setShowCancel] = useState(false)

	useEffect(() => {
		sendScreenView('Detalhes da Assinatura', 'SubscriptionDetails')
		load()
		getSavedCards()
			.then(profile => setCards(profile?.payments || []))
			.catch(e => console.error('getSavedCards error', e))
		getAddresses()
			.then(setAddresses)
			.catch(e => console.error('getAddresses error', e))
	}, [])

	const load = async () => {
		setIsLoading(true)
		try {
			const result = await getSubscription(subscriptionId)
			setSubscription(result)
			loadSkuProducts(result.items.map(item => item.skuId)).then(setProducts)
			simulateSubscription(subscriptionId)
				.then(setSimulation)
				.catch(e => console.error('simulateSubscription error', e))
		} catch (e) {
			console.error('getSubscription error', e)
		} finally {
			setIsLoading(false)
		}
	}

	const save = async action => {
		setIsSaving(true)
		try {
			await action()
			await load()
			showSnackBar('success', t('subscriptions.saved'))
			return true
		} catch (e) {
			console.error('subscription save error', e)
			return false
		} finally {
			setIsSaving(false)
		}
	}

	const saveTitle = async title => {
		if (await save(() => updateSubscription(subscriptionId, { title }))) setShowRename(false)
	}

	const changeStatus = status => {
		if (status === subscription.status) return
		if (status === 'CANCELED') return setShowCancel(true)
		save(() => updateSubscription(subscriptionId, { status }))
	}

	const saveItems = async () => {
		const changed = editingItems.filter(edited => {
			const original = subscription.items.find(item => item.id === edited.id)
			return edited.removed || original.quantity !== edited.quantity
		})
		const ok = await save(() =>
			Promise.all(
				changed.map(item =>
					item.removed
						? removeSubscriptionItem(subscriptionId, item.id)
						: updateSubscriptionItem(subscriptionId, item.id, { quantity: item.quantity })
				)
			)
		)
		if (ok) setEditingItems(null)
	}

	const savePrefs = async () => {
		const card = cards.find(item => item.id === editingPrefs.paymentAccountId)
		const ok = await save(() =>
			updateSubscription(subscriptionId, {
				plan: { ...subscription.plan, frequency: editingPrefs.frequency },
				purchaseSettings: {
					...subscription.purchaseSettings,
					paymentMethod: {
						...subscription.purchaseSettings.paymentMethod,
						paymentAccountId: editingPrefs.paymentAccountId,
						paymentSystem: card?.paymentSystem ?? subscription.purchaseSettings.paymentMethod.paymentSystem,
						paymentSystemName:
							card?.paymentSystemName ?? subscription.purchaseSettings.paymentMethod.paymentSystemName
					}
				},
				shippingAddress: { addressId: editingPrefs.addressId, addressType: 'residential' }
			})
		)
		if (ok) setEditingPrefs(null)
	}

	const updateEditingItem = (id, patch) => {
		setEditingItems(prev => prev.map(item => (item.id === id ? { ...item, ...patch } : item)))
	}

	const startEditingPrefs = () => {
		setEditingPrefs({
			frequency: subscription.plan.frequency,
			paymentAccountId: subscription.purchaseSettings?.paymentMethod?.paymentAccountId,
			addressId: subscription.shippingAddress?.addressId
		})
	}

	const frequencyOptions = (() => {
		const firstProduct = subscription?.items.map(item => products[item.skuId]?.product).find(Boolean)
		const parsed = parseFrequencyOptions(firstProduct, subscription?.plan?.id)
		const current = subscription?.plan?.frequency
		const all =
			current && !parsed.some(option => frequencyKey(option) === frequencyKey(current))
				? [current, ...parsed]
				: parsed
		return all.map(frequency => ({ value: frequencyKey(frequency), label: frequencyLabel(frequency), frequency }))
	})()

	const cardLabel = card => (card ? `${card.paymentSystemName} ${card.cardNumber}` : t('subscriptions.cardNotFound'))
	const addressLabel = address =>
		address ? `${address.street}, ${address.number}` : t('subscriptions.addressNotFound')
	const findAddress = addressId => addresses.find(address => (address.addressId ?? address.id) === addressId)
	const findCard = paymentAccountId => cards.find(card => card.id === paymentAccountId)

	const currentCard = findCard(subscription?.purchaseSettings?.paymentMethod?.paymentAccountId)
	const currentAddress = findAddress(subscription?.shippingAddress?.addressId)
	const isEditable = subscription?.status === 'ACTIVE' || subscription?.status === 'PAUSED'

	const totals = simulation?.totals || []
	const totalValue = totals.reduce((sum, total) => sum + (total.value || 0), 0)

	const renderItem = item => {
		const info = products[item.skuId]
		const edited = editingItems?.find(edit => edit.id === item.id)
		if (edited?.removed) return null
		const quantity = edited?.quantity ?? item.quantity
		return (
			<View
				key={item.id}
				className='flex flex-row gap-3 py-3 border-b border-gray-100'>
				<View className='w-[56px] h-[56px] shrink-0 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden'>
					{info?.imageUrl ? (
						<Image
							src={info.imageUrl}
							className='max-w-full max-h-full'
						/>
					) : (
						<FiPackage
							size={22}
							className='text-gray-400'
						/>
					)}
				</View>
				<View className='flex flex-col flex-1 gap-1'>
					{info?.brand && <Text className='text-[10px] uppercase text-gray-500'>{info.brand}</Text>}
					<Text className='text-sm text-gray-900'>{info?.name || `SKU ${item.skuId}`}</Text>
					<View className='flex flex-row items-center justify-between mt-1'>
						{editingItems ? (
							<View className='flex flex-row items-center gap-3 border border-gray-300 rounded-lg px-2 py-1'>
								<View
									onClick={() =>
										quantity > 1 && updateEditingItem(item.id, { quantity: quantity - 1 })
									}>
									<FiMinus
										size={14}
										className={quantity > 1 ? 'text-gray-800' : 'text-gray-300'}
									/>
								</View>
								<Text className='text-sm font-semibold'>{quantity}</Text>
								<View onClick={() => updateEditingItem(item.id, { quantity: quantity + 1 })}>
									<FiPlus
										size={14}
										className='text-gray-800'
									/>
								</View>
							</View>
						) : (
							<Text className='text-xs text-gray-500'>
								{t('subscriptions.units', { count: quantity })}
							</Text>
						)}
						<View className='flex flex-row items-center gap-3'>
							{typeof info?.price === 'number' && (
								<Text className='text-sm font-semibold text-gray-900'>
									{formatPrice(info.price * quantity)}
								</Text>
							)}
							{editingItems && (
								<View onClick={() => updateEditingItem(item.id, { removed: true })}>
									<FiTrash2
										size={18}
										className='text-error'
									/>
								</View>
							)}
						</View>
					</View>
				</View>
			</View>
		)
	}

	const renderPrefRow = (label, value, onClick) => (
		<View
			className={`flex flex-col gap-1 py-3 border-b border-gray-100 ${onClick ? 'border rounded-lg px-3 mt-1 border-gray-300' : ''}`}
			onClick={onClick}>
			<Text className='text-xs text-gray-500'>{label}</Text>
			<View className='flex flex-row items-center justify-between'>
				<Text className='text-sm text-gray-900 flex-1'>{value}</Text>
				{onClick && (
					<FiChevronDown
						size={16}
						className='text-gray-700'
					/>
				)}
			</View>
		</View>
	)

	return (
		<ProtectedView afterLoginRedirectTo={'Subscriptions'}>
			<Page title='Detalhes da Assinatura'>
				<HeaderContentWrapper>
					<HeaderReturn />
					<HeaderText text={t('subscriptions.detailsTitle')} />
				</HeaderContentWrapper>

				<Loading
					fullScreen
					isLoading={isLoading || isSaving}
				/>

				{subscription && (
					<View className='flex flex-col gap-4 p-4'>
						<View className='flex flex-col gap-2'>
							<View
								className='flex flex-row items-start gap-2'
								onClick={() => setShowRename(true)}>
								<Text className='text-xl font-bold text-gray-900 flex-1'>
									{subscriptionTitle(subscription, products, t)}
								</Text>
								<FiEdit2
									size={16}
									className='text-primary mt-1 shrink-0'
								/>
							</View>
							<Text className='text-sm text-gray-600'>
								{t('subscriptions.nextCharge', {
									date: formatDateDaysMonthYear(subscription.nextPurchaseDate),
									interpolation: { escapeValue: false }
								})}
							</Text>
							<View className='flex flex-row items-center justify-between mt-1'>
								<SubscriptionStatusBadge
									status={subscription.status}
									onClick={
										isEditable
											? () =>
													setPicker({
														title: t('subscriptions.changeStatus'),
														value: subscription.status,
														options: STATUS_OPTIONS.map(status => ({
															value: status,
															label: t(`subscriptions.status.${status}`)
														})),
														onSelect: changeStatus
													})
											: undefined
									}
								/>
								<View
									className='flex flex-row items-center gap-1'
									onClick={() => setShowHistory(true)}>
									<FiClock
										size={16}
										className='text-primary'
									/>
									<Text className='text-sm font-semibold text-primary'>
										{t('subscriptions.history')}
									</Text>
								</View>
							</View>
						</View>

						<GenericBox>
							<View className='flex flex-row items-center justify-between mb-2'>
								<Text className='text-lg font-bold text-gray-900'>{t('subscriptions.products')}</Text>
								{isEditable && !editingItems && (
									<View
										className='p-1'
										onClick={() =>
											setEditingItems(
												subscription.items.map(item => ({
													id: item.id,
													quantity: item.quantity
												}))
											)
										}>
										<FiEdit2
											size={16}
											className='text-primary'
										/>
									</View>
								)}
							</View>
							{subscription.items.map(renderItem)}
							{editingItems && (
								<View className='flex flex-row gap-2 mt-4'>
									<View className='flex-1'>
										<CustomButton
											variant='outlined'
											label={t('subscriptions.cancel')}
											onPress={() => setEditingItems(null)}
										/>
									</View>
									<View className='flex-1'>
										<CustomButton
											label={t('subscriptions.save')}
											disabled={editingItems.every(item => item.removed)}
											onPress={saveItems}
										/>
									</View>
								</View>
							)}
						</GenericBox>

						<GenericBox>
							<View className='flex flex-row items-center justify-between mb-2'>
								<Text className='text-lg font-bold text-gray-900'>
									{t('subscriptions.preferences')}
								</Text>
								{isEditable && !editingPrefs && (
									<View
										className='p-1'
										onClick={startEditingPrefs}>
										<FiEdit2
											size={16}
											className='text-primary'
										/>
									</View>
								)}
							</View>

							{editingPrefs ? (
								<View className='flex flex-col gap-2'>
									{renderPrefRow(
										t('subscriptions.frequency'),
										frequencyLabel(editingPrefs.frequency),
										() =>
											setPicker({
												title: t('subscriptions.frequency'),
												value: frequencyKey(editingPrefs.frequency),
												options: frequencyOptions,
												onSelect: value =>
													setEditingPrefs(prev => ({
														...prev,
														frequency: frequencyOptions.find(
															option => option.value === value
														).frequency
													}))
											})
									)}
									{renderPrefRow(
										t('subscriptions.paymentMethod'),
										cardLabel(findCard(editingPrefs.paymentAccountId)),
										() =>
											setPicker({
												title: t('subscriptions.paymentMethod'),
												value: editingPrefs.paymentAccountId,
												options: cards
													.filter(card => !card.isExpired)
													.map(card => ({ value: card.id, label: cardLabel(card) })),
												onSelect: value =>
													setEditingPrefs(prev => ({ ...prev, paymentAccountId: value }))
											})
									)}
									{renderPrefRow(
										t('subscriptions.shippingAddress'),
										addressLabel(findAddress(editingPrefs.addressId)),
										() =>
											setPicker({
												title: t('subscriptions.shippingAddress'),
												value: editingPrefs.addressId,
												options: addresses.map(address => ({
													value: address.addressId ?? address.id,
													label: addressLabel(address),
													description: `${address.neighborhood} - ${address.city}/${address.state}`
												})),
												onSelect: value =>
													setEditingPrefs(prev => ({ ...prev, addressId: value }))
											})
									)}
									<View className='flex flex-row gap-2 mt-4'>
										<View className='flex-1'>
											<CustomButton
												variant='outlined'
												label={t('subscriptions.cancel')}
												onPress={() => setEditingPrefs(null)}
											/>
										</View>
										<View className='flex-1'>
											<CustomButton
												label={t('subscriptions.save')}
												onPress={savePrefs}
											/>
										</View>
									</View>
								</View>
							) : (
								<View className='flex flex-col'>
									{renderPrefRow(
										t('subscriptions.frequency'),
										frequencyLabel(subscription.plan?.frequency)
									)}
									<View className='flex flex-col gap-1 py-3 border-b border-gray-100'>
										<Text className='text-xs text-gray-500'>
											{t('subscriptions.paymentMethod')}
										</Text>
										<View className='flex flex-row items-center gap-2'>
											<FiCreditCard
												size={18}
												className='text-gray-700'
											/>
											<Text className='text-sm text-gray-900'>
												{currentCard
													? cardLabel(currentCard)
													: subscription.purchaseSettings?.paymentMethod?.paymentSystemName ||
														t('subscriptions.cardNotFound')}
											</Text>
										</View>
									</View>
									<View className='flex flex-col gap-1 py-3'>
										<Text className='text-xs text-gray-500'>
											{t('subscriptions.shippingAddress')}
										</Text>
										{currentAddress ? (
											<View className='flex flex-col'>
												<Text className='text-sm text-gray-900'>
													{addressLabel(currentAddress)}
												</Text>
												<Text className='text-sm text-gray-900'>
													{currentAddress.neighborhood} - {currentAddress.city} -{' '}
													{currentAddress.state}
												</Text>
												<Text className='text-sm text-gray-900'>
													{currentAddress.postalCode}
												</Text>
											</View>
										) : (
											<Text className='text-sm text-gray-900'>
												{t('subscriptions.addressNotFound')}
											</Text>
										)}
									</View>
								</View>
							)}
						</GenericBox>

						{totals.length > 0 && (
							<GenericBox>
								<Text className='text-lg font-bold text-gray-900 mb-2'>
									{t('subscriptions.summary')}
								</Text>
								{totals.map(total => (
									<View
										key={total.id}
										className='flex flex-row justify-between py-1'>
										<Text className='text-sm text-gray-700'>
											{t(`subscriptions.totals.${total.id}`, total.id)}
										</Text>
										<Text className='text-sm text-gray-900'>{formatPriceInCents(total.value)}</Text>
									</View>
								))}
								<View className='flex flex-row justify-between pt-3 mt-2 border-t border-gray-100'>
									<Text className='text-base font-bold text-gray-900'>
										{t('subscriptions.totals.Total')}
									</Text>
									<Text className='text-base font-bold text-gray-900'>
										{formatPriceInCents(totalValue)}
									</Text>
								</View>
							</GenericBox>
						)}
					</View>
				)}

				<OptionPicker
					title={picker?.title}
					options={picker?.options}
					value={picker?.value}
					onSelect={picker?.onSelect}
					onClose={() => setPicker(null)}
				/>

				<SubscriptionRenameModal
					show={showRename}
					initialTitle={subscription?.title}
					isSaving={isSaving}
					onSave={saveTitle}
					onClose={() => setShowRename(false)}
				/>

				<SubscriptionHistoryModal
					show={showHistory}
					subscriptionId={subscriptionId}
					onClose={() => setShowHistory(false)}
				/>

				<ModalConfirm
					showModal={showCancel}
					message={t('subscriptions.confirmCancel')}
					removeItem={async () => {
						setShowCancel(false)
						save(() => updateSubscription(subscriptionId, { status: 'CANCELED' }))
					}}
					closeModal={() => setShowCancel(false)}
				/>

				<BottomInset />
			</Page>
		</ProtectedView>
	)
}
