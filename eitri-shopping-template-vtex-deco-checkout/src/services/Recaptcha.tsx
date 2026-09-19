import React, { forwardRef, useEffect, useImperativeHandle } from 'react'

interface RecaptchaProps {
	onRecaptchaReady?: () => void
	siteKey?: string
}

export interface RecaptchaHandle {
	getRecaptchaToken: () => Promise<string | undefined>
}

const Recaptcha = forwardRef<RecaptchaHandle, RecaptchaProps>((props, ref) => {
	const { onRecaptchaReady, siteKey } = props

	useEffect(() => {
		initRecaptcha()
	}, [])

	const initRecaptcha = async () => {
		try {
			await waitForElement('#g-recaptcha-button')
			window?.grecaptcha?.render('g-recaptcha-button')
			window.eitriShopRecaptchaOnSubmit = () => {}
			if (onRecaptchaReady) onRecaptchaReady()
		} catch (error) {
			console.error(error)
		}
	}

	const waitForElement = (selector: string): Promise<Element> => {
		return new Promise(resolve => {
			const existing = document.querySelector(selector)
			if (existing) {
				return resolve(existing)
			}

			const observer = new MutationObserver(mutations => {
				const found = document.querySelector(selector)
				if (found) {
					observer.disconnect()
					resolve(found)
				}
			})

			observer.observe(document.body, {
				childList: true,
				subtree: true
			})
		})
	}

	useImperativeHandle(ref, () => {
		return {
			async getRecaptchaToken() {
				try {
					const token = await window?.grecaptcha?.execute()
					return token
				} catch (e) {
					console.error(e)
					return undefined
				}
			}
		}
	})

	return (
		<>
			<button
				id='g-recaptcha-button'
				className='g-recaptcha'
				data-sitekey={siteKey}
				data-callback='eitriShopRecaptchaOnSubmit'
				data-action='submit'></button>
		</>
	)
})

export default Recaptcha
