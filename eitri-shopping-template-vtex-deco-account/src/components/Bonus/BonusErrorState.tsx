import { useEffect } from 'react'
import Eitri from 'eitri-bifrost'
import { View, Text } from 'eitri-luminus'
import { CustomButton, AlertIcon } from 'eitri-shopping-template-vtex-deco-shared'
import { useTranslation } from 'eitri-i18n'

interface BonusErrorStateProps {
	onRetryPress?: () => void
	[key: string]: unknown
}

/**
 * Shown when the bonus gateway call fails (timeout, offline, 5xx, ...) —
 * distinct from BonusEmptyState, which is a legitimate zero-balance result.
 */
export default function BonusErrorState(props: BonusErrorStateProps) {
	const { onRetryPress } = props
	const { t } = useTranslation()

	useEffect(() => {
		Eitri.bottomBar.show().catch(() => {})
	}, [])

	return (
		<View className='flex flex-col items-center px-4 pt-16'>
			<View className='w-16 h-16 rounded-full bg-red-50 flex items-center justify-center'>
				<AlertIcon
					size={30}
					className='text-red-500'
				/>
			</View>

			<Text className='text-[20px] font-bold text-gray-900 text-center leading-snug mt-5'>
				{t('bonusScreen.errorTitle')}
			</Text>

			<Text className='text-[11px] text-gray-500 text-center leading-relaxed mt-2 px-6'>
				{t('bonusScreen.errorDescription')}
			</Text>

			<View className='w-full mt-6'>
				<CustomButton
					label={t('bonusScreen.errorRetryCta')}
					borderRadius='rounded'
					height='h-[46px]'
					onPress={onRetryPress}
				/>
			</View>
		</View>
	)
}
