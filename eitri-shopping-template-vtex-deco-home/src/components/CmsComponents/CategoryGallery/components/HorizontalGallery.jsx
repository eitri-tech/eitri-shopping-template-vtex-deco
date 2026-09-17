import { useCallback, useEffect, useRef, useState } from 'react'
import { Image, Text, View } from 'eitri-luminus'

export default function HorizontalGallery(props) {
    const { categories, contentVisible, onClick, aspectRatio } = props
    const scrollRef = useRef(null)
    const [scrollState, setScrollState] = useState({ visibleRatio: 1, progress: 0 })
    const itemCount = categories.length

    const readScrollState = element => {
        if (!element) return
        const { scrollWidth, clientWidth, scrollLeft } = element
        const maxScroll = scrollWidth - clientWidth
        setScrollState({
            visibleRatio: scrollWidth > 0 ? Math.min(1, clientWidth / scrollWidth) : 1,
            progress: maxScroll > 0 ? Math.max(0, Math.min(1, scrollLeft / maxScroll)) : 0
        })
    }

    useEffect(() => {
        const element = scrollRef.current
        if (element) element.scrollLeft = 0
        readScrollState(element)
    }, [categories])

    const handleScroll = useCallback(event => {
        readScrollState(event.currentTarget)
    }, [])

    const { visibleRatio, progress } = scrollState
    const showScrollBar = itemCount > 1 && visibleRatio < 1
    const thumbWidth = `${Math.max(visibleRatio * 100, 12)}%`
    const thumbOffset = `${progress * (100 - Math.max(visibleRatio * 100, 12))}%`

    return (
        <View
            className={`flex flex-col -mx-4 transition-opacity duration-150 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}
        >
            <View
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
                <View className="flex gap-2 px-4">
                    {categories.map((category, index) => (
                        <View
                            key={index}
                            className="w-[40vw] min-w-[40vw] flex flex-col items-center"
                            onClick={() => onClick(category)}
                        >
                            <View
                                className={`w-full ${aspectRatio ? '' : 'aspect-[3/4]'} bg-gray-100 overflow-hidden`}
                                style={aspectRatio ? { aspectRatio: aspectRatio.replace(':', '/') } : undefined}
                            >
                                {category.imageUrl ? (
                                    <Image
                                        src={category.imageUrl}
                                        className="w-full h-full object-cover"
                                    />
                                ) : null}
                            </View>
                            {category.title ? (
                                <Text className="text-sm text-center text-gray-900 mt-1">
                                    {category.title}
                                </Text>
                            ) : null}
                        </View>
                    ))}
                </View>
            </View>

            {showScrollBar ? (
                <View className="flex justify-center mt-4">
                    <View className="relative w-[52vw] h-[4px] rounded-full bg-gray-200 overflow-hidden">
                        <View className="flex h-full">
                            <View className="h-full shrink-0" style={{ width: thumbOffset }} />
                            <View
                                className="h-full rounded-full bg-gray-900 transition-[width] duration-150 ease-out shrink-0"
                                style={{ width: thumbWidth }}
                            />
                        </View>
                    </View>
                </View>
            ) : null}
        </View>
    )
}
