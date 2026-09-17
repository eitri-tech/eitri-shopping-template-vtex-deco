import { useState, useEffect, useRef } from 'react'
import { View, Text, Image, Video } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import { useTranslation } from 'eitri-i18n'
import { resolveVideoProps } from '../../../utils/videoUtils'

const STORAGE_KEY = 'welcome-modal-dismissal'
const DISMISS_DURATION_IN_MILISECONDS =  30 * 60 * 1000

export default function WelcomeModal(props) {
	const { data } = props

	const [visible, setVisible] = useState(false)
	const [ready, setReady] = useState(false)
	const videoRef = useRef(null)

	const resolvedBackground = data?.backgroundImage || data?.externalBackgroundImage
	const resolvedVideo = data?.backgroundVideo || data?.externalBackgroundVideo
	const resolvedLogo = data?.logoImage || data?.externalLogoImage
	const { t } = useTranslation()

	useEffect(() => {
		checkVisibility()

		const onResume = async () => {
			try {
				const logged = await isUserLoggedIn()
				if (logged) setVisible(false)
			} catch (e) {}
		}

		Eitri.navigation.addOnResumeListener(onResume)
	}, [])

	useEffect(() => {
		if (visible) {
			Eitri.bottomBar.hide().catch(() => {})
		} else {
			Eitri.bottomBar.show().catch(() => {})
		}
		return () => {
			Eitri.bottomBar.show().catch(() => {})
		}
	}, [visible])

	const isUserLoggedIn = async () => {
		try {
			const { Vtex } = await import('eitri-shopping-vtex-shared')
			return await Vtex.customer.isLoggedIn()
		} catch (e) {
			return false
		}
	}

	const checkVisibility = async () => {
		try {
			const logged = await isUserLoggedIn()
			if (logged) {
				setReady(true)
				return
			}

			const stored = await Eitri.storage.getItemJson(STORAGE_KEY)
			if (stored?.timestamp) {
				const elapsed = Date.now() - stored.timestamp
				if (elapsed < DISMISS_DURATION_IN_MILISECONDS) {
					setReady(true)
					return
				}
			}

			setVisible(true)
		} catch (e) {
			console.error('WelcomeModal: erro ao verificar visibilidade', e)
		} finally {
			setReady(true)
		}
	}

	const handleDismiss = async () => {
		try {
			await Eitri.storage.setItemJson(STORAGE_KEY, { timestamp: Date.now() })
		} catch (e) {
			console.error('WelcomeModal: erro ao salvar dismissal', e)
		}
		setVisible(false)
	}

	const handleLogin = () => {
		Eitri.nativeNavigation.open({
			slug: 'account',
			initParams: { route: 'SignInVariant' }
		})
	}

	const handleSignUp = () => {
		Eitri.nativeNavigation.open({
			slug: 'account',
			initParams: { route: 'SignUp', fromWelcome: true }
		})
	}

	const handleVideoEnded = () => {
		if (videoRef.current?.setCurrentTime) {
			videoRef.current.setCurrentTime(0)
			videoRef.current.play?.()
		}
	}

	if (!ready || !visible) return null

	const videoProps = resolveVideoProps(resolvedVideo)
	const hasBackground = videoProps || resolvedBackground

	if (!hasBackground) return null

	return (
		<View
			className='fixed inset-0 z-[9999] flex flex-col'
			width='100%'
			height='100vh'>
			{videoProps ? (
				<Video
					ref={videoRef}
					{...videoProps}
					className='absolute inset-0 w-full h-full object-cover'
					width='100%'
					height='100%'
					autoPlay
					muted
					loop={true}
					controls={false}
					playsInline
					onEnded={handleVideoEnded}
					/>
			) : (
				<Image
					src={resolvedBackground}
					className='absolute inset-0 w-full h-full object-cover'
					width='100%'
					height='100%'
					/>
			)}

			{resolvedLogo ? (
				<View className='absolute top-0 left-0 right-0 h-1/2 flex items-center justify-center z-10'>
					<Image src={resolvedLogo} height='40px' />
				</View>
			) : null}

			<View className='absolute bottom-0 left-0 right-0 flex flex-col'>
				<View className='h-12 bg-[linear-gradient(180deg,transparent_0%,#000000_100%)]' />
				<View className='bg-black pt-8 px-4 pb-10 flex flex-col items-center gap-4'>
				<Text className='text-center text-white text-base leading-6 px-2'>{t('welcomeModal.description')}</Text>

				<View
					className='w-full flex items-center justify-center h-14 bg-[#F2C94C] rounded-lg'
					onClick={handleLogin}>
					<Text className='text-black font-bold text-xl'>{t('welcomeModal.login')}</Text>
				</View>

				<View
					className='w-full flex items-center justify-center h-14 rounded-lg border border-white'
					onClick={handleSignUp}>
					<Text className='text-white font-bold text-xl'>{t('welcomeModal.signUp')}</Text>
				</View>

				<View
					className='flex items-center justify-center py-2'
					onClick={handleDismiss}>
					<Text className='text-white text-sm underline'>{t('welcomeModal.continue')}</Text>
				</View>
				</View>
			</View>
		</View>
	)
}
