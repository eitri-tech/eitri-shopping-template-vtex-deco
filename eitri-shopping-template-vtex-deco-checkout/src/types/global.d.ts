export {}

declare global {
	interface Window {
		grecaptcha?: {
			render: (containerId: string) => void
			execute: () => Promise<string>
			[key: string]: unknown
		}
		eitriShopRecaptchaOnSubmit?: () => void
	}
}
