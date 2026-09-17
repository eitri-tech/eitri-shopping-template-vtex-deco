import { Vtex } from 'eitri-shopping-vtex-shared'
import Eitri from 'eitri-bifrost'
import { HiOutlineClipboardDocument, HiOutlineClipboardDocumentCheck } from 'react-icons/hi2'
import { TextInput, FormControl, List } from 'eitri-luminus'
import { TrashIcon } from 'eitri-shopping-template-vtex-deco-shared'
import { isLoggedIn } from '../services/CustomerService'
import { processActions } from '../services/ResolveCmsActions'

export default function Cartman() {
	const [cart, setCart] = useState()
	const [copied, setCopied] = useState(false)
	const [copiedKeys, setCopiedKeys] = useState(false)
	const [storageKeys, setStorageKeys] = useState(null)
	const [customerData, setCustomerData] = useState(null)
	const [isLogged, setIsLogged] = useState(false)
	const [sessionData, setSessionData] = useState(null)
	const [sessionTokens, setSessionTokens] = useState(null)
	const [copiedSession, setCopiedSession] = useState(false)
	const [manualTitle, setManualTitle] = useState('')
	const [facetKey, setFacetKey] = useState('')
	const [facetValue, setFacetValue] = useState('')
	const [manualFacets, setManualFacets] = useState([])
	const [sfModuleCheck, setSfModuleCheck] = useState(null)

	useEffect(() => {
		getCart()
		loadCustomerData()
		loadSessionData()
	}, [])

	const loadCustomerData = async () => {
		try {
			const logged = await isLoggedIn()
			setIsLogged(logged)
			if (logged) {
				const result = await Vtex.customer.getCustomerProfile()
				const profile = result?.data?.profile
				console.log('customerData', profile)
				setCustomerData(profile)
			}
		} catch (error) {
			console.log('Erro ao buscar dados do cliente', error)
		}
	}

	const loadSessionData = async () => {
		try {
			const session = await Vtex.session.getSession()
			console.log('getSession', session)
			setSessionData(session)
		} catch (error) {
			console.log('Erro ao buscar sessão', error)
		}
		try {
			const tokens = await Vtex.session.createSession()
			console.log('createSession', tokens)
			setSessionTokens(tokens)
		} catch (error) {
			console.log('Erro ao criar sessão', error)
		}
	}

	const copySessionData = () => {
		const text = JSON.stringify({ sessionData, sessionTokens }, null, 2)
		Eitri.clipboard.setText({ text })
		setCopiedSession(true)
		setTimeout(() => setCopiedSession(false), 2000)
	}

	const getCart = async () => {
		try {
			const cart = await Vtex.cart.getCartIfExists()
			setCart(cart)
		} catch (error) {
			console.log('Erro ao buscar carrinho', error)
			setCart(null)
		}
	}

	const copyOrderFormId = () => {
		if (!cart?.orderFormId) return
		Eitri.clipboard.setText({
			text: cart.orderFormId
		})
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	const generateNewCart = async () => {
		const cart = await Vtex.cart.generateNewCart()
		setCart(cart)
	}

	const addRandomItem = async () => {
		const products = await Vtex.catalog.legacyParamsSearch('fq=P:%5B0%2520TO%252099999%5D&_from=0&_to=49')
		const product = products[Math.floor(Math.random() * products.length)]
		const sku = product.items[0]
		const result = await Vtex.cart.addItem(sku)
		setCart(result)
	}

	const clearStorage = async () => {
		await Eitri.storage.clearAll()
		setStorageKeys(null)
	}

	const copyStorageKeys = () => {
		if (!storageKeys) return
		const text = storageKeys.map(e => (typeof e === 'string' ? e : JSON.stringify(e))).join('\n')
		Eitri.clipboard.setText({ text })
		setCopiedKeys(true)
		setTimeout(() => setCopiedKeys(false), 2000)
	}

	const showStorageKeys = async () => {
		try {
			const keys = await Eitri.storage.keysAll()
			setStorageKeys(keys)
		} catch (e) {
			console.error('Erro ao listar keys', e)
			setStorageKeys([])
		}
	}

	const checkSalesforceModule = async () => {
		try {
			const modules = await Eitri.modules()
			setSfModuleCheck({
				hasSalesforce: !!modules?.salesforce,
				hasLogEvent: typeof modules?.salesforce?.logEvent === 'function',
				keys: Object.keys(modules?.salesforce || {})
			})
		} catch (e) {
			setSfModuleCheck({ error: e?.message })
		}
	}

	const goToHome = async () => {
		Eitri.navigation.navigate({ path: 'Home', replace: true })
		return
	}

	const addManualFacet = () => {
		if (!facetKey || !facetValue) return
		setManualFacets([...manualFacets, { key: facetKey, value: facetValue }])
		setFacetKey('')
		setFacetValue('')
	}

	const removeManualFacet = index => {
		setManualFacets(manualFacets.filter((_, i) => i !== index))
	}

	const testManualFacetsAction = () => {
		if (manualFacets.length === 0) return
		console.log('[DEBUG] testManualFacetsAction: facets manuais', manualFacets)
		processActions({
			action: {
				type: 'facets',
				title: manualTitle || 'Debug Facetas Manual',
				facets: manualFacets
			}
		})
	}

	const clearCart = async () => {
		const result = await Vtex.cart.removeAllItems()
		setCart(result)
	}

	const removeRegion = async () => {
		try {
			await Vtex.customer.removeRegion()
			getCart()
		} catch (e) {
			console.error('Erro ao remover região', e)
		}
	}

	const clearShippingAddress = async () => {
		try {
			const newCart = await Vtex.checkout.setLogisticInfo({
				clearAddressIfPostalCodeNotFound: true,
				selectedAddresses: [],
				logisticsInfo: cart?.shippingData?.logisticsInfo?.map((info, index) => ({
					itemIndex: index,
					selectedSla: null,
					selectedDeliveryChannel: null,
					addressId: null
				}))
			})
			setCart(newCart)
		} catch (e) {
			console.error('Erro ao limpar endereço', e)
		}
	}

	return (
		<Page
			bottomInset
			topInset>
			<View
				className='p-4 flex flex-col gap-4 mt-6'
				bottomInset
				topInset>
				<View className='flex flex-col gap-3 bg-base-200 rounded-xl p-4'>
					<Text className='text-sm font-semibold text-neutral-content'>Informações da sacola</Text>
					<View className='flex flex-row items-center justify-between'>
						<Text className='text-xs text-gray-500 flex-1'>{cart?.orderFormId || 'Sem sacola'}</Text>
						<View
							onClick={copyOrderFormId}
							className='pl-2'>
							{copied ? (
								<HiOutlineClipboardDocumentCheck
									size={20}
									color='green'
								/>
							) : (
								<HiOutlineClipboardDocument size={20} />
							)}
						</View>
					</View>
					{cart?.items?.length > 0 && (
						<View className='flex flex-col gap-1 pt-1 border-t border-base-300'>
							<Text className='text-xs font-medium text-neutral-content'>{`${cart.items.length} item(ns) na sacola`}</Text>
							{cart.items.map(item => (
								<Text
									key={item.uniqueId}
									className='text-xs text-gray-500'>
									{item?.name}
								</Text>
							))}
						</View>
					)}
				</View>

				<View className='border-t border-base-300' />

				<View className='flex flex-col gap-3'>
					<Button
						className='btn-primary text-white w-full'
						onClick={addRandomItem}>
						Adicionar item aleatório
					</Button>
					<Button
						className='btn-primary text-white w-full'
						onClick={generateNewCart}>
						Nova sacola
					</Button>
					<Button
						className='btn-primary text-white w-full'
						onClick={clearCart}>
						Limpar sacola
					</Button>
					<Button
						className='btn-primary text-white w-full'
						onClick={removeRegion}>
						Remover região (session + storage)
					</Button>
					<Button
						className='btn-primary text-white w-full'
						onClick={clearShippingAddress}>
						Limpar endereço do carrinho
					</Button>
					<Button
						className='btn-primary text-white w-full'
						onClick={clearStorage}>
						Limpar storage
					</Button>
					<Button
						className='btn-primary text-white w-full'
						onClick={showStorageKeys}>
						Listar storage keys
					</Button>
					<Button
						className='btn-primary text-white w-full'
						onClick={goToHome}>
						Ir pra Home
					</Button>
					<Button
						className='btn-secondary text-white w-full'
						onClick={checkSalesforceModule}>
						Verificar módulo Salesforce
					</Button>
				</View>

				{sfModuleCheck && (
					<View className='flex flex-col gap-1 bg-base-200 rounded-xl p-4'>
						<Text className='text-sm font-semibold text-neutral-content'>Módulo Salesforce</Text>
						<Text className='text-xs text-gray-500 break-all'>{JSON.stringify(sfModuleCheck, null, 2)}</Text>
					</View>
				)}

				<View className='flex flex-col gap-3 bg-base-200 rounded-xl p-4 w-full'>
					<Text className='text-sm font-semibold text-neutral-content'>[DEBUG] Facetas manuais</Text>

					<FormControl className='w-full'>
						<Text className='text-xs text-gray-500'>Título (opcional)</Text>
						<TextInput
							value={manualTitle}
							onChange={e => setManualTitle(e.target.value)}
							placeholder='Ex: Product search query'
							className='w-full h-10 px-3 border border-gray-300 border-solid bg-white text-sm rounded'
						/>
					</FormControl>

					<FormControl className='w-full'>
						<Text className='text-xs text-gray-500'>Key</Text>
						<TextInput
							value={facetKey}
							onChange={e => setFacetKey(e.target.value)}
							placeholder='Ex: brand'
							className='w-full h-10 px-3 border border-gray-300 border-solid bg-white text-sm rounded'
						/>
					</FormControl>

					<FormControl className='w-full'>
						<Text className='text-xs text-gray-500'>Value</Text>
						<TextInput
							value={facetValue}
							onChange={e => setFacetValue(e.target.value)}
							placeholder='Ex: your-store'
							className='w-full h-10 px-3 border border-gray-300 border-solid bg-white text-sm rounded'
						/>
					</FormControl>

					<Button
						className='btn-primary text-white w-full'
						onClick={addManualFacet}>
						+ Adicionar faceta
					</Button>

					{manualFacets.length > 0 && (
						<List className='w-full bg-white rounded-lg border border-base-300 border-solid'>
							{manualFacets.map((facet, index) => (
								<List.Item
									key={`${facet.key}-${facet.value}-${index}`}
									className='flex flex-row items-center justify-between w-full'>
									<Text className='text-xs text-gray-600 flex-1'>{`${facet.key}: ${facet.value}`}</Text>
									<View onClick={() => removeManualFacet(index)}>
										<TrashIcon
											size={18}
											className='text-red-400'
										/>
									</View>
								</List.Item>
							))}
						</List>
					)}

					<Button
						className='btn-secondary text-white w-full'
						onClick={testManualFacetsAction}>
						[DEBUG] Testar facetas manuais
					</Button>
				</View>

				<View className='flex flex-col gap-3 bg-base-200 rounded-xl p-4'>
				<Text className='text-sm font-semibold text-neutral-content'>Dados do cliente</Text>
				{isLogged && customerData ? (
					<View className='flex flex-col gap-1'>
						<Text className='text-xs text-gray-500'>Nome: {customerData.firstName} {customerData.lastName}</Text>
						<Text className='text-xs text-gray-500'>Email: {customerData.email}</Text>
						<Text className='text-xs text-gray-500'>Documento: {customerData.document}</Text>
						<Text className='text-xs text-gray-500'>Telefone: {customerData.homePhone}</Text>
					</View>
				) : (
					<Text className='text-xs text-gray-500'>{isLogged ? 'Carregando...' : 'Não logado'}</Text>
				)}
			</View>

			<View className='flex flex-col gap-3 bg-base-200 rounded-xl p-4'>
				<View className='flex flex-row items-center justify-between'>
					<Text className='text-sm font-semibold text-neutral-content'>Sessão VTEX</Text>
					<View
						onClick={copySessionData}
						className='pl-2'>
						{copiedSession ? (
							<HiOutlineClipboardDocumentCheck
								size={20}
								color='green'
							/>
						) : (
							<HiOutlineClipboardDocument size={20} />
						)}
					</View>
				</View>
				{sessionTokens && (
					<View className='flex flex-col gap-1 pt-1 border-t border-base-300'>
						<Text className='text-xs font-medium text-neutral-content'>createSession()</Text>
						<Text className='text-xs text-gray-500 break-all'>sessionToken: {sessionTokens.sessionToken || 'N/A'}</Text>
						<Text className='text-xs text-gray-500 break-all'>segmentToken: {sessionTokens.segmentToken || 'N/A'}</Text>
					</View>
				)}
				{sessionData && (
					<View className='flex flex-col gap-1 pt-1 border-t border-base-300'>
						<Text className='text-xs font-medium text-neutral-content'>getSession()</Text>
						<Text className='text-xs text-gray-500 break-all'>
							{JSON.stringify(sessionData, null, 2)}
						</Text>
					</View>
				)}
				{!sessionTokens && !sessionData && (
					<Text className='text-xs text-gray-500'>Carregando...</Text>
				)}
			</View>

			{storageKeys && (
					<View className='flex flex-col gap-2 bg-base-200 rounded-xl p-4'>
						<View className='flex flex-row items-center justify-between'>
							<Text className='text-sm font-semibold text-neutral-content'>
								{`Storage keys (${storageKeys.length})`}
							</Text>
							<View
								onClick={copyStorageKeys}
								className='pl-2'>
								{copiedKeys ? (
									<HiOutlineClipboardDocumentCheck
										size={20}
										color='green'
									/>
								) : (
									<HiOutlineClipboardDocument size={20} />
								)}
							</View>
						</View>
						{storageKeys.length === 0 && (
							<Text className='text-xs text-gray-500'>Nenhuma key encontrada</Text>
						)}
						{storageKeys.map((entry, i) => (
							<Text
								key={i}
								className='text-xs text-gray-500 break-all'>
								{typeof entry === 'string' ? entry : JSON.stringify(entry)}
							</Text>
						))}
					</View>
				)}
			</View>
		</Page>
	)
}
