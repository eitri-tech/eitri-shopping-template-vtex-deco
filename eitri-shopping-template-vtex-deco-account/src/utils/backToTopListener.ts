import Eitri from 'eitri-bifrost'

export const addonUserTappedActiveTabListener = (): void => {
	// eventBus.subscribe's own docs say custom string channels are supported, but the .d.ts
	// only types `channel` as the EventBusCommonEvents enum — cast to keep this custom channel.
	Eitri.eventBus.subscribe({
		channel: 'onUserTappedActiveTab' as any,
		callback: (_: unknown) => {
			Eitri.navigation.backToTop()
		}
	})
}
