import { View, Text, Image } from 'eitri-luminus'
import { CustomButton } from 'eitri-shopping-monte-carlo-shared'
import { useTranslation } from 'eitri-i18n'
import BonusHelpSection from './BonusHelpSection'
import bonusIcon from '../../assets/images/bonus.png'

/**
 * Shown when the shopper has no available bonus balance.
 */
export default function BonusEmptyState(props) {
	const { onPrimaryPress, onSecondaryPress, onWhatsapp, onFaq } = props
	const { t } = useTranslation()

	return (
		<View className='flex flex-col'>
			<View className='flex flex-col items-center px-4 pt-16'>
				<Image
					src={bonusIcon}
					width='44px'
					height='44px'
				/>

				<Text className='text-[20px] font-bold text-gray-900 text-center leading-snug mt-5'>
					{t('bonusScreen.emptyTitle')}
				</Text>

				<Text className='text-[11px] text-gray-500 text-center leading-relaxed mt-2 px-6'>
					{t('bonusScreen.emptyDescription')}
				</Text>

				<View className='w-full flex flex-col gap-3 mt-6'>
					<CustomButton
						label={t('bonusScreen.emptyPrimaryCta')}
						borderRadius='rounded'
						height='h-[46px]'
						onPress={onPrimaryPress}
					/>

					<View
						onClick={onSecondaryPress}
						className='w-full h-[46px] rounded border border-gray-300 bg-white flex items-center justify-center'>
						<Text className='text-[14px] text-gray-900'>{t('bonusScreen.emptySecondaryCta')}</Text>
					</View>
				</View>
			</View>

			<BonusHelpSection
				onWhatsapp={onWhatsapp}
				onFaq={onFaq}
			/>
		</View>
	)
}
