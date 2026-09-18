import { useState, useEffect, useRef } from 'react'
import { View, Text, Image, Video } from 'eitri-luminus'
import { processActions } from '../services/ResolveCmsActions'
import { getTimeRemaining, formatCountdown } from '../utils/countdownUtils'
import { resolveVideoProps } from '../utils/videoUtils'
import type { CmsAction } from './types'
import type { ImageWidget } from '../types/widgets'

const safeParse = (s?: string): Date | null => {
	if (!s) return null
	const d = new Date(s)
	return isNaN(d.getTime()) ? null : d
}

export interface Props {
	/**
	 * @title Título.
	 */
	title?: string
	/**
	 * @title Descrição.
	 */
	description?: string
	/**
	 * @title Texto do CTA.
	 */
	ctaText?: string
	/**
	 * @title Modo do conteúdo (logo | countdown).
	 */
	contentMode?: string
	/**
	 * @title Imagem do logo.
	 */
	logoImage?: ImageWidget
	externalLogoImage?: string
	/**
	 * @title Imagem de fundo.
	 */
	backgroundImage?: ImageWidget
	externalBackgroundImage?: string
	/**
	 * @title Vídeo de fundo (YouTube/Vimeo/URL).
	 */
	backgroundVideo?: string
	externalBackgroundVideo?: string
	/**
	 * @title Data de início.
	 */
	startDate?: string
	/**
	 * @title Data de término.
	 */
	endDate?: string
	/**
	 * @title Proporção (ex.: "9:16").
	 */
	aspectRatio?: string
	action?: CmsAction
}

export default function VideoHero({
	title,
	description,
	ctaText,
	contentMode = 'logo',
	logoImage,
	externalLogoImage,
	backgroundImage,
	externalBackgroundImage,
	backgroundVideo,
	externalBackgroundVideo,
	startDate,
	endDate,
	action
}: Props) {
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
	const videoRef = useRef<any>(null)

	const resolvedBackgroundImage = backgroundImage || externalBackgroundImage
	const resolvedBackgroundVideo = backgroundVideo || externalBackgroundVideo
	const resolvedLogoImage = logoImage || externalLogoImage

	const parsedStartDate = safeParse(startDate)
	const parsedEndDate = safeParse(endDate)

	const now = new Date()
	const isInDateRange = !(parsedStartDate && now < parsedStartDate) && !(parsedEndDate && now >= parsedEndDate)
	const showCountdown = contentMode === 'countdown' && parsedEndDate && isInDateRange

	const [expired, setExpired] = useState(false)
	const [countdown, setCountdown] = useState<string | null>(() => {
		if (showCountdown) return formatCountdown(getTimeRemaining(parsedEndDate))
		return null
	})

	useEffect(() => {
		if (!showCountdown) return

		intervalRef.current = setInterval(() => {
			const rem = getTimeRemaining(parsedEndDate)
			if (!rem) {
				if (intervalRef.current) clearInterval(intervalRef.current)
				setExpired(true)
				return
			}
			setCountdown(formatCountdown(rem))
		}, 60000)

		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current)
		}
	}, [])

	const handleCtaPress = () => {
		if (action?.type && action.type !== 'none') {
			processActions({ action })
		}
	}

	const handleVideoEnded = () => {
		if (videoRef.current?.setCurrentTime) {
			videoRef.current.setCurrentTime(0)
			videoRef.current.play?.()
		}
	}

	const videoProps = resolveVideoProps(resolvedBackgroundVideo)
	const hasBackground = videoProps || resolvedBackgroundImage

	if (!isInDateRange || expired || !hasBackground) return null

	return (
		<View
			onClick={handleCtaPress}
			className='relative overflow-hidden'
			height='100vh'
			width='100%'>

			{videoProps ? (
				<Video
					ref={videoRef}
					{...videoProps}
					className='absolute inset-0 w-full h-full'
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
					src={resolvedBackgroundImage ?? ''}
					className='absolute inset-0 w-full h-full object-cover'
					width='100%'
					height='100%'
				/>
			)}

			<View className='absolute inset-0 bg-black opacity-20' />

			<View className='absolute inset-0 flex flex-col items-center justify-center px-8 gap-6'>
				{contentMode === 'logo' && resolvedLogoImage ? (
					<Image
						src={resolvedLogoImage}
						height='32px'
					/>
				) : null}

				{contentMode === 'countdown' && countdown ? (
					<Text className='text-white text-sm font-bold tracking-widest'>{countdown}</Text>
				) : null}

				{title ? (
					<Text className='text-white text-4xl text-center family-poppins font-bold'>{title}</Text>
				) : null}

				{description ? (
					<Text className='text-white text-base text-center opacity-80'>{description}</Text>
				) : null}

				{ctaText ? (
					<View onClick={handleCtaPress}>
						<Text className='text-white text-base underline text-center'>{ctaText}</Text>
					</View>
				) : null}
			</View>
		</View>
	)
}
