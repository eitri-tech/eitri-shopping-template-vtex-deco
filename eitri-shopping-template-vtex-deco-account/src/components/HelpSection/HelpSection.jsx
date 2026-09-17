import Eitri from 'eitri-bifrost'
import { Divisor, WhatsappIcon, InfoCircleIcon, ArrowRightIcon } from 'eitri-shopping-monte-carlo-shared'
import { RemoteConfig } from 'eitri-shopping-vtex-shared'
import { useTranslation } from 'eitri-i18n'

const WHATSAPP_FALLBACK_URL =
	'https://api.whatsapp.com/send/?phone=%2B5521995714886&text=Ol%C3%A1%21+Gostaria+da+ajuda+de+uma+consultora+digital%21&type=phone_number&app_absent=0'
const FAQ_FALLBACK_URL = 'https://montecarlojoias.zendesk.com/hc/pt-br'

export default function HelpSection(props) {
	const { t } = useTranslation()
	const { className } = props

	const openLink = (url, inApp) => {
		Eitri.openBrowser({ url, inApp })
	}

	const openWhatsApp = () => {
		const url = RemoteConfig.getContent('appConfigs.account.helpLinks.whatsappUrl') || WHATSAPP_FALLBACK_URL
		openLink(url, false)
	}

	const openFaq = () => {
		const url = RemoteConfig.getContent('appConfigs.account.helpLinks.faqUrl') || FAQ_FALLBACK_URL
		openLink(url, true)
	}

	return (
		<View className={`px-4 ${className || 'mt-4'}`}>
			<View className='mt-4 mb-4'>
				<Text className='font-bold text-base text-gray-900'>{t('helpSection.title')}</Text>
			</View>
			<View className='flex flex-col'>
				<View
					className='flex flex-row justify-between items-center py-4'
					onClick={openWhatsApp}>
					<View className='flex flex-row items-center gap-3'>
						<WhatsappIcon
							size={20}
							className='text-gray-700'
						/>
						<Text className='text-gray-700'>{t('helpSection.whatsapp')}</Text>
					</View>
					<ArrowRightIcon
						size={16}
						className='text-gray-500'
					/>
				</View>
				<Divisor />
				<View
					className='flex flex-row justify-between items-center py-4'
					onClick={openFaq}>
					<View className='flex flex-row items-center gap-3'>
						<InfoCircleIcon
							size={20}
							className='text-gray-700'
						/>
						<Text className='text-gray-700'>{t('helpSection.faq')}</Text>
					</View>
					<ArrowRightIcon
						size={16}
						className='text-gray-500'
					/>
				</View>
				<Divisor />
			</View>
		</View>
	)
}
