import { useState, useEffect, useRef } from 'react'
import { View, Text, Image, Video } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import { useTranslation } from 'eitri-i18n'
import { isLoggedIn } from '../services/CustomerService'
import TrackingService from '../services/TrackingService'
import { resolveVideoProps } from '../utils/videoUtils'
import CloseIcon from '../components/CloseIcon/CloseIcon'
import type { ImageWidget } from '../types/widgets'

const STORAGE_KEY = 'welcome-modal-dismissal'
const DISMISS_DURATION_IN_MILISECONDS =  30 * 60 * 1000

export interface Props {
	/**
	 * @title Imagem de fundo.
	 */
	backgroundImage?: ImageWidget
	/**
	 * @title Url de imagem de fundo externa.
	 */
	externalBackgroundImage?: string
	/**
	 * @title Video de fundo.
	 */
	backgroundVideo?: string
	/**
	 * @title Url de video de fundo externo (YouTube, Vimeo ou MP4).
	 */
	externalBackgroundVideo?: string
	/**
	 * @title Imagem do logo.
	 */
	logoImage?: ImageWidget
	/**
	 * @title Url de imagem do logo externa.
	 */
	externalLogoImage?: string
}

export default function WelcomeModal({
	backgroundImage,
	externalBackgroundImage,
	backgroundVideo,
	externalBackgroundVideo,
	logoImage,
	externalLogoImage
}: Props) {
	const { t } = useTranslation()
	const [visible, setVisible] = useState(false)
	const [ready, setReady] = useState(false)
	const videoRef = useRef<any>(null)

	const resolvedBackground = backgroundImage || externalBackgroundImage
	const resolvedVideo = backgroundVideo || externalBackgroundVideo
	const resolvedLogo = logoImage || externalLogoImage

	useEffect(() => {
		checkVisibility()

		const onResume = async () => {
			const logged = await isLoggedIn()
			if (logged) {
				setVisible(false)
			}
		}

		Eitri.navigation.addOnResumeListener(onResume)
	}, [])

	useEffect(() => {
		if (!ready) return
		if (visible) {
			Eitri.bottomBar.hide().catch(() => {})
		} else {
			Eitri.bottomBar.show().catch(() => {})
		}
		return () => {
			Eitri.bottomBar.show().catch(() => {})
		}
	}, [visible, ready])

	const checkVisibility = async () => {
		try {
			const logged = await isLoggedIn()
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
		TrackingService.selectContentEvent({ content_type: 'welcome_modal', content_id: 'continue_without_login' })
		try {
			await Eitri.storage.setItemJson(STORAGE_KEY, { timestamp: Date.now() })
		} catch (e) {
			console.error('WelcomeModal: erro ao salvar dismissal', e)
		}
		setVisible(false)
	}

	const handleLogin = () => {
		TrackingService.selectContentEvent({ content_type: 'welcome_modal', content_id: 'login' })
		Eitri.nativeNavigation.open({
			slug: 'account',
			initParams: { route: 'SignInVariant' }
		})
	}

	const handleSignUp = () => {
		TrackingService.selectContentEvent({ content_type: 'welcome_modal', content_id: 'sign_up' })
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

	if (!ready) {
		return <View className='fixed inset-0 z-[9999] bg-white' />
	}

	if (!visible) return null

	const videoProps = resolveVideoProps(resolvedVideo)
	const hasBackground = videoProps || resolvedBackground

	if (!hasBackground) return null

	return (
		<View
			className='fixed inset-0 z-[9999] flex flex-col'
			width='100%'
			height='100vh'>
			<View
				className='absolute top-20 right-8 z-20 rounded-full bg-white/60 flex items-center justify-center'
				width='37px'
				height='37px'
				onClick={handleDismiss}>
				<CloseIcon size={18} className='text-black' />
			</View>

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
					src={resolvedBackground ?? ''}
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
				<View className='h-12' />
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
