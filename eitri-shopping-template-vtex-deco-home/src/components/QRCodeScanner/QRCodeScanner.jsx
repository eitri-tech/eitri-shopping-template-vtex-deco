import Eitri from 'eitri-bifrost'
import { Text, View } from 'eitri-luminus'
import { getProductByEan } from '../../services/ProductService'
import { openProduct } from '../../services/NavigationService'
import { MdOutlineQrCodeScanner } from 'react-icons/md'
import { useTranslation } from 'eitri-i18n'

let toastTimeoutId

export default function QRCodeScanner(props) {
	const { t } = useTranslation()
	const [isToastVisible, setIsToastVisible] = useState(false)

	useEffect(() => {
		return () => {
			if (toastTimeoutId) {
				clearTimeout(toastTimeoutId)
			}
		}
	}, [])

	const showNotFoundFeedback = () => {
		console.log('exibundo feedback')
		setIsToastVisible(true)

		toastTimeoutId = setTimeout(() => {
			setIsToastVisible(false)
		}, 5000)
	}

	const scanQRCode = async () => {
		try {
			const modules = await Eitri.modules()

			// retrocompatibility with older scanner implementations using camera namespace
			const codeScannerModule = modules.codeScanner ?? modules.camera
			const startScannerMethod = codeScannerModule?.startScanner

			if (!startScannerMethod) {
				return // codeScanner module is unavailable, disable UI elements related to code scanning
			}

			// const scannedValue = await Eitri.exposedApis.camera.startScanner({ formats: ['qr_code', 'ean_13'] })

			const scannedValue = await startScannerMethod({
				formats: ['qr_code', 'ean_13'], // qr_code, aztec, data_matrix, pdf417, code_128, ean_13, ...
				layout: {
					skin: {
						code: 'barcode_portrait', // qr_code, barcode_portrait, barcode_landscape, ...
						laserAnimation: {
							enabled: true,
							color: '#FF0000'
						}
					},
					i18n: {
						title: 'Escanear código de barras',
						description: 'Centralize o código para escanear',
						torch: 'Lanterna'
					},
					buttons: ['torch']
				}
			})

			const sanitizedValue = scannedValue.trim()

			// Verifica se o valor escaneado é uma URL/deeplink
			const isDeeplink = /^(https?:\/\/|mailto:|tel:|sms:)/i.test(sanitizedValue)
			if (isDeeplink) {
				return {
					type: 'deeplink',
					value: sanitizedValue
				}
			}

			// Se não for deeplink, retorna como EAN
			return {
				type: 'ean',
				value: sanitizedValue
			}
		} catch (error) {
			console.log('Erro ao ler QRCode: ', error)
			return undefined
		}
	}

	const handleScan = async () => {
		const scanResult = await scanQRCode()
		if (!scanResult) return

		if (scanResult.type === 'deeplink') {
			Eitri.nativeNavigation.open({
				slug: 'eitri-shopping-torra-deeplink-resolver',
				initParams: { deeplink: scanResult.value }
			})
		} else if (scanResult.type === 'ean') {
			const product = await getProductByEan(scanResult.value)
			if (!product) {
				showNotFoundFeedback()
				return
			}
			openProduct(product)
		}
	}

	return (
		<View>
			<View
				className={'w-[44px] h-[44px] flex justify-end items-center'}
				onClick={handleScan}>
				<MdOutlineQrCodeScanner
					className={'text-header-content'}
					size={24}
				/>
			</View>
			{isToastVisible && (
				<View className='fixed bottom-[0px] left-[0px] right-[0px] z-[9999]'>
					<View className={'w-full flex justify-center items-center p-4 mb-2'}>
						<View className='flex justify-center rounded-lg bg-black/80 px-4 py-3 w-[80%]'>
							<Text className='text-white text-xs font-medium'>{t('qrCodeScanner.productNotFound')}</Text>
						</View>
					</View>

					<View
						bottomInset={'auto'}
						className={'w-full'}
					/>
				</View>
			)}
		</View>
	)
}
