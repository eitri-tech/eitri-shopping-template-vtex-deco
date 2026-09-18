import { View, Text } from 'eitri-luminus'
import { CustomButton, UserIcon } from 'eitri-shopping-template-vtex-deco-shared'
import { useTranslation } from 'eitri-i18n'
import BonusHelpSection from './BonusHelpSection'

/**
 * Shown when the shopper is logged in but has no CPF on their profile — the
 * bonus gateway requires one (see BonusExtractService.fetchBonusExtract) and
 * fails with a bare BAD_REQUEST that looks identical to a generic outage, so
 * this must be detected client-side (missing `customer.document`) before the
 * gateway is ever called, and guide the shopper to register it instead of
 * dead-ending on BonusErrorState's "try again later".
 */
export default function BonusMissingCpfState(props) {
	const { onPrimaryPress, onWhatsapp, onFaq } = props
	const { t } = useTranslation()

	return (
		<View className='flex flex-col'>
			<View className='flex flex-col items-center px-4 pt-16'>
				<View className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center'>
					<UserIcon
						size={30}
						strokeWidth={1.5}
						className='text-gray-700'
					/>
				</View>

				<Text className='text-[20px] font-bold text-gray-900 text-center leading-snug mt-5'>
					{t('bonusScreen.missingCpfTitle')}
				</Text>

				<Text className='text-[11px] text-gray-500 text-center leading-relaxed mt-2 px-6'>
					{t('bonusScreen.missingCpfDescription')}
				</Text>

				<View className='w-full mt-6'>
					<CustomButton
						label={t('bonusScreen.missingCpfCta')}
						borderRadius='rounded'
						height='h-[46px]'
						onPress={onPrimaryPress}
					/>
				</View>
			</View>

			<BonusHelpSection
				onWhatsapp={onWhatsapp}
				onFaq={onFaq}
			/>
		</View>
	)
}
