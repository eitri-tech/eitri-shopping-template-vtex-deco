import React, { forwardRef, useEffect, useImperativeHandle } from 'react'

const Recaptcha = forwardRef((props, ref) => {
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

	const waitForElement = selector => {
		return new Promise(resolve => {
			if (document.querySelector(selector)) {
				return resolve(document.querySelector(selector))
			}

			const observer = new MutationObserver(() => {
				if (document.querySelector(selector)) {
					observer.disconnect()
					resolve(document.querySelector(selector))
				}
			})

			observer.observe(document.body, {
				childList: true,
				subtree: true
			})
		})
	}

	useImperativeHandle(ref, () => ({
		async getRecaptchaToken() {
			try {
				return await window?.grecaptcha?.execute()
			} catch (e) {
				console.error(e)
			}
		}
	}))

	return (
		<>
			<button
				id='g-recaptcha-button'
				className='g-recaptcha'
				data-sitekey={siteKey}
				data-callback='eitriShopRecaptchaOnSubmit'
				data-action='submit'
			/>
		</>
	)
})

export default Recaptcha
