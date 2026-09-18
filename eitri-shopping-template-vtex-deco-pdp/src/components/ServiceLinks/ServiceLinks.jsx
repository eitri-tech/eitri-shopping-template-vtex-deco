import Eitri from 'eitri-bifrost'
import { Text, View } from 'eitri-luminus'
import { useTranslation } from 'eitri-i18n'
import { RemoteConfig } from 'eitri-shopping-vtex-shared'
import { CircularArrowIcon, SupportIcon, PaymentIcon } from 'eitri-shopping-template-vtex-deco-shared'

const SERVICE_LINKS = [
	{
		id: 'returns',
		labelKey: 'serviceLinks.returns',
		remoteConfigKey: 'appConfigs.pdp.serviceLinks.exchangeAndReturnsUrl',
		// TODO: replace with your exchange/returns policy URL
		fallbackUrl: '',
		inApp: true
	},
	{
		id: 'digitalSeller',
		labelKey: 'serviceLinks.digitalSeller',
		remoteConfigKey: 'appConfigs.pdp.serviceLinks.digitalConsultantUrl',
		// TODO: replace with your WhatsApp/digital consultant URL
		fallbackUrl: '',
		inApp: false
	},
	{
		id: 'paymentMethods',
		labelKey: 'serviceLinks.paymentMethods',
		remoteConfigKey: 'appConfigs.pdp.serviceLinks.paymentMethodsUrl',
		// TODO: replace with your payment methods FAQ URL
		fallbackUrl: '',
		inApp: true
	}
]

function ArrowIcon() {
	return (
		<svg
			width='24'
			height='24'
			viewBox='0 0 24 24'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'>
			<path
				d='M5 12H19M14 7L19 12L14 17'
				stroke='currentColor'
				strokeWidth='1.5'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	)
}

function ServiceIcon(props) {
	const { id } = props

	if (id === 'returns') return <CircularArrowIcon size={24} />
	if (id === 'digitalSeller') return <SupportIcon size={24} />
	return <PaymentIcon size={24} />
}

export default function ServiceLinks() {
	const { t } = useTranslation()

	const openLink = item => {
		const url = RemoteConfig.getContent(item.remoteConfigKey) || item.fallbackUrl

		Eitri.openBrowser({
			url,
			inApp: item.inApp
		})
	}

	return (
		<View className='px-4 mt-4 flex flex-col gap-3'>
			{SERVICE_LINKS.map(item => (
				<View
					key={item.id}
					onClick={() => openLink(item)}
					className='min-h-[58px] px-4 border border-neutral-400 flex flex-row items-center gap-4 bg-base-100'>
					<View className='shrink-0 flex items-center justify-center text-base-content'>
						<ServiceIcon id={item.id} />
					</View>

					<Text className='flex-1 text-lg text-base-content'>{t(item.labelKey)}</Text>

					<View className='shrink-0 flex items-center justify-center text-base-content'>
						<ArrowIcon />
					</View>
				</View>
			))}
		</View>
	)
}
