import Eitri from 'eitri-bifrost'
import Datadog from '../services/Datadog'

export function isAppVersionBelow(currentVersion?: string | null, minimumVersion?: string | null): boolean {
	if (!currentVersion || !minimumVersion) return false
	const current = currentVersion.split('.').map(Number)
	const minimum = minimumVersion.split('.').map(Number)
	for (let i = 0; i < Math.max(current.length, minimum.length); i++) {
		const c = current[i] || 0
		const m = minimum[i] || 0
		if (c < m) return true
		if (c > m) return false
	}
	return false
}

const TAB_BADGE_MIN_VERSION = '1.1.2'
let tabIndex: number | null = null

export async function getCartTabBadgeIndex(): Promise<number> {
	try {
		const config = await Eitri.getConfigs()
		const currentVersion = config?.superAppData?.version
		tabIndex = isAppVersionBelow(currentVersion, TAB_BADGE_MIN_VERSION) ? 1 : 3
		Datadog.sendDatadogWarningLog({ currentVersion, tabIndex })
	} catch (e) {
		tabIndex = 3
	}
	return tabIndex ?? 3
}
