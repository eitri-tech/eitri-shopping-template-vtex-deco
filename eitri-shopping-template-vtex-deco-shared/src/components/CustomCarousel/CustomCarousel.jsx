import React, { useState, useEffect, useCallback } from 'react'

// Função para gerar ID único
const generateUniqueId = () => `carousel-${Math.random().toString(36).substr(2, 9)}`

export default function CustomCarousel({
	children,
	autoPlay = false,
	interval = 3000,
	loop = true,
	onSlideChange = () => {}
}) {
	const [currentSlide, setCurrentSlide] = useState(0)
	const [isDragging, setIsDragging] = useState(false)
	const [startX, setStartX] = useState(0)
	const [currentX, setCurrentX] = useState(0)
	const [dragOffset, setDragOffset] = useState(0)
	const [carouselId] = useState(generateUniqueId())

	const slides = React.Children.toArray(children)
	const totalSlides = slides.length

	// Função para ir para o próximo slide
	const nextSlide = useCallback(() => {
		const nextIndex = loop ? (currentSlide + 1) % totalSlides : Math.min(currentSlide + 1, totalSlides - 1)

		if (nextIndex !== currentSlide) {
			onSlideChange(nextIndex, currentSlide)
			setCurrentSlide(nextIndex)
		}
	}, [currentSlide, totalSlides, loop, onSlideChange])

	// Função para ir para o slide anterior
	const prevSlide = useCallback(() => {
		const prevIndex = loop ? (currentSlide - 1 + totalSlides) % totalSlides : Math.max(currentSlide - 1, 0)

		if (prevIndex !== currentSlide) {
			onSlideChange(prevIndex, currentSlide)
			setCurrentSlide(prevIndex)
		}
	}, [currentSlide, totalSlides, loop, onSlideChange])

	// Auto play
	useEffect(() => {
		if (autoPlay && !isDragging) {
			const timer = setInterval(nextSlide, interval)
			return () => clearInterval(timer)
		}
	}, [autoPlay, interval, nextSlide, isDragging])

	// Handlers para touch/mouse events
	const handleStart = clientX => {
		setIsDragging(true)
		setStartX(clientX)
		setCurrentX(clientX)
		setDragOffset(0)
	}

	const handleMove = clientX => {
		if (!isDragging) return

		const diff = clientX - startX
		setCurrentX(clientX)
		setDragOffset(diff)
	}

	const handleEnd = () => {
		if (!isDragging) return

		const diff = currentX - startX
		const threshold = 50 // Minimum distance to trigger slide change

		if (Math.abs(diff) > threshold) {
			if (diff > 0) {
				prevSlide()
			} else {
				nextSlide()
			}
		}

		setIsDragging(false)
		setDragOffset(0)
	}

	// Touch events
	const handleTouchStart = e => {
		handleStart(e.touches[0].clientX)
	}

	const handleTouchMove = e => {
		e.preventDefault()
		handleMove(e.touches[0].clientX)
	}

	const handleTouchEnd = () => {
		handleEnd()
	}

	// Mouse events (para desktop)
	const handleMouseDown = e => {
		e.preventDefault()
		handleStart(e.clientX)
	}

	const handleMouseMove = e => {
		handleMove(e.clientX)
	}

	const handleMouseUp = () => {
		handleEnd()
	}

	const handleMouseLeave = () => {
		if (isDragging) {
			handleEnd()
		}
	}

	// Calcular transform
	const getTransform = () => {
		const slideOffset = -currentSlide * 100
		const dragOffsetPercent = dragOffset ? (dragOffset / window.innerWidth) * 100 : 0
		return `translateX(${slideOffset + dragOffsetPercent}%)`
	}

	return (
		<View className='relative w-full overflow-hidden'>
			{/* Container dos slides */}
			<View
				id={`${carouselId}-container`}
				className='flex transition-transform duration-300 ease-out'
				style={{
					transform: getTransform(),
					transitionDuration: isDragging ? '0ms' : '300ms'
				}}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				onMouseDown={handleMouseDown}
				onMouseMove={isDragging ? handleMouseMove : undefined}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseLeave}>
				{slides.map((slide, index) => (
					<View
						key={index}
						id={`${carouselId}-slide-${index}`}
						className='flex-shrink-0 w-full'>
						{slide}
					</View>
				))}
			</View>
		</View>
	)
}
