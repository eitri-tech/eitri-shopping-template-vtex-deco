import { useEffect, useState } from 'react'
import { View, Text } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import { useTranslation } from 'eitri-i18n'

export default function AppVersion() {
	const { t } = useTranslation()
	const [version, setVersion] = useState(null)

	useEffect(() => {
		Eitri.getConfigs()
			.then(config => {
				setVersion(config?.superAppData?.version ?? null)
			})
			.catch(err => console.error('AppVersion: failed to get configs', err))
	}, [])

	if (!version) return null

	return (
		<View>
			<Text className={'text-xs'}>{t('appVersion.label', { version })}</Text>
		</View>
	)
}
