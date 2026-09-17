import { Text, View } from 'eitri-luminus'
import { FiChevronDown } from 'react-icons/fi'
import { useTranslation } from 'eitri-i18n'
import { STATUS_VARIANTS } from '../../utils/subscription'

const VARIANT_STYLES: Record<string, { wrapper: string; text: string }> = {
	success: { wrapper: 'bg-success', text: 'text-success-content' },
	warning: { wrapper: 'bg-warning', text: 'text-warning-content' },
	neutral: { wrapper: 'bg-neutral', text: 'text-neutral-content' }
}

interface SubscriptionStatusBadgeProps {
	status?: string
	onClick?: () => void
}

export default function SubscriptionStatusBadge(props: SubscriptionStatusBadgeProps) {
	const { status, onClick } = props
	const { t } = useTranslation()
	const styles = VARIANT_STYLES[STATUS_VARIANTS[status ?? ''] || 'neutral']

	return (
		<View
			className={`w-fit inline-flex items-center gap-1 px-2 py-1 rounded-lg ${styles.wrapper}`}
			onClick={onClick}>
			<Text className={`text-xs font-bold ${styles.text}`}>{t(`subscriptions.status.${status}`, status)}</Text>
			{onClick && (
				<FiChevronDown
					size={14}
					className={styles.text}
				/>
			)}
		</View>
	)
}
