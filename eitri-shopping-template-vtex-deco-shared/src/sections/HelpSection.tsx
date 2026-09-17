import { View, Text } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import { RemoteConfig } from 'eitri-shopping-vtex-shared'
import { useTranslation } from 'eitri-i18n'
import Divisor from '../components/Divisor/Divisor'
import WhatsappIcon from '../components/WhatsappIcon/WhatsappIcon'
import InfoCircleIcon from '../components/InfoCircleIcon/InfoCircleIcon'
import ArrowRightIcon from '../components/ArrowRightIcon/ArrowRightIcon'

// TODO: replace with your WhatsApp support URL
const WHATSAPP_FALLBACK_URL = ''
// TODO: replace with your FAQ/help center URL
const FAQ_FALLBACK_URL = ''

/**
 * Bloco "Precisa de ajuda?" (WhatsApp + FAQ), reaproveitado em várias telas.
 * @title Precisa de ajuda?
 */
export interface Props {
	/**
	 * @title Título
	 */
	title?: string
	/**
	 * @title Texto do link do WhatsApp
	 */
	whatsapp?: string
	/**
	 * @title Texto do link do FAQ
	 */
	faq?: string
	/**
	 * @title Link do WhatsApp
	 * @format uri
	 * @default
	 */
	whatsappUrl?: string
	/**
	 * @title Link do FAQ
	 * @format uri
	 * @default
	 */
	faqUrl?: string
}

export default function HelpSection({ title, whatsapp, faq, whatsappUrl, faqUrl }: Props) {
	const { t } = useTranslation()

	const openLink = (url: string, inApp?: boolean) => {
		Eitri.openBrowser({ url, inApp })
	}

	const openWhatsApp = () => {
		const url = whatsappUrl?.trim() || RemoteConfig.getContent('appConfigs.account.helpLinks.whatsappUrl') || WHATSAPP_FALLBACK_URL
		openLink(url, false)
	}

	const openFaq = () => {
		const url = faqUrl?.trim() || RemoteConfig.getContent('appConfigs.account.helpLinks.faqUrl') || FAQ_FALLBACK_URL
		openLink(url, true)
	}

	return (
		<View className='px-4 mt-4'>
			<View className='mt-4 mb-4'>
				<Text className='font-bold text-base text-gray-900'>{title ?? t('helpSection.title')}</Text>
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
						<Text className='text-gray-700'>{whatsapp ?? t('helpSection.whatsapp')}</Text>
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
						<Text className='text-gray-700'>{faq ?? t('helpSection.faq')}</Text>
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
