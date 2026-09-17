import { CustomButton, CustomInput } from 'eitri-shopping-template-vtex-deco-shared'
import { FiX } from 'react-icons/fi'
import { useTranslation } from 'eitri-i18n'

export default function SubscriptionRenameModal(props) {
	const { show, initialTitle, onSave, onClose, isSaving } = props
	const { t } = useTranslation()
	const [title, setTitle] = useState(initialTitle || '')

	useEffect(() => {
		setTitle(initialTitle || '')
	}, [initialTitle, show])

	if (!show) return null

	return (
		<View className='z-[9999] !bg-black/70 !opacity-100 fixed inset-0 flex items-center justify-center'>
			<View className='flex flex-col p-4 bg-white rounded-lg w-11/12 max-w-sm gap-4'>
				<View className='flex justify-between items-center'>
					<Text className='font-bold text-lg text-gray-900'>{t('subscriptions.renameTitle')}</Text>
					<View
						className='p-1'
						onClick={onClose}>
						<FiX
							size={20}
							className='text-gray-700'
						/>
					</View>
				</View>
				<CustomInput
					value={title}
					onChange={e => setTitle(e.target.value)}
				/>
				<View className='flex flex-col gap-2'>
					<CustomButton
						label={t('subscriptions.save')}
						isLoading={isSaving}
						disabled={!title.trim()}
						onPress={() => onSave(title.trim())}
					/>
					<CustomButton
						variant='outlined'
						label={t('subscriptions.cancel')}
						onPress={onClose}
					/>
				</View>
			</View>
		</View>
	)
}
