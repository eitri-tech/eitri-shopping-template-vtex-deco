import { useState, useEffect, useRef } from 'react'
import { View, Text, Image, Video } from 'eitri-luminus'
import { processActions } from '../../../services/ResolveCmsActions'
import { getTimeRemaining, formatCountdown } from '../../../utils/countdownUtils'
import { resolveVideoProps } from '../../../utils/videoUtils'

const safeParse = (s) => {
	if (!s) return null
	const d = new Date(s)
	return isNaN(d.getTime()) ? null : d
}

export default function VideoHero(props) {
	const { data } = props

	const intervalRef = useRef(null)
	const videoRef = useRef(null)

	const backgroundImage = data?.backgroundImage || data?.externalBackgroundImage
	const backgroundVideo = data?.backgroundVideo || data?.externalBackgroundVideo
	const contentMode = data?.contentMode || 'logo'
	const logoImage = data?.logoImage || data?.externalLogoImage
	const title = data?.title
	const description = data?.description
	const ctaText = data?.ctaText

	const startDate = safeParse(data?.startDate)
	const endDate = safeParse(data?.endDate)

	const now = new Date()
	const isInDateRange = !(startDate && now < startDate) && !(endDate && now >= endDate)
	const showCountdown = contentMode === 'countdown' && endDate && isInDateRange

	const [expired, setExpired] = useState(false)
	const [countdown, setCountdown] = useState(() => {
		if (showCountdown) return formatCountdown(getTimeRemaining(endDate))
		return null
	})

	useEffect(() => {
		if (!showCountdown) return

		intervalRef.current = setInterval(() => {
			const rem = getTimeRemaining(endDate)
			if (!rem) {
				clearInterval(intervalRef.current)
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
		if (data?.action?.type && data.action.type !== 'none') {
			processActions(data)
		}
	}

	const handleVideoEnded = () => {
		if (videoRef.current?.setCurrentTime) {
			videoRef.current.setCurrentTime(0)
			videoRef.current.play?.()
		}
	}

	const videoProps = resolveVideoProps(backgroundVideo)
	const hasBackground = videoProps || backgroundImage

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
					src={backgroundImage}
					className='absolute inset-0 w-full h-full object-cover'
					width='100%'
					height='100%'
				/>
			)}

			<View className='absolute inset-0 bg-black opacity-20' />

			<View className='absolute inset-0 flex flex-col items-center justify-center px-8 gap-6'>
				{contentMode === 'logo' && logoImage ? (
					<Image
						src={logoImage}
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
