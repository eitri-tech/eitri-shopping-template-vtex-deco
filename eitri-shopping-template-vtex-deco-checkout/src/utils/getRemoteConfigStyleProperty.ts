import Eitri from 'eitri-bifrost'

export const getRemoteAppConfigProperty = async (property: string): Promise<unknown> => {
	const remoteConfig = await Eitri.environment.getRemoteConfigs()
	const appConfigs = remoteConfig?.appConfigs as Record<string, unknown> | undefined
	return appConfigs?.[property]
}
