import { Image, Text, View } from 'eitri-luminus'

export default function VerticalGallery(props) {
    const { categories, contentVisible, onClick, aspectRatio } = props
    const containerStyle = aspectRatio ? { aspectRatio: aspectRatio.replace(':', '/') } : undefined

    return (
        <View
            className={`flex flex-wrap transition-opacity duration-150 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}
        >
            {categories.map((category, index) => (
                <View
                    key={index}
                    className="w-1/2 flex flex-col items-center pb-4 px-1"
                    onClick={() => onClick(category)}
                >
                    <View className={`w-full ${aspectRatio ? '' : 'h-[270px]'} bg-gray-100 overflow-hidden`} style={containerStyle}>
                        {category.imageUrl ? (
                            <Image
                                src={category.imageUrl}
                                className="w-full h-full object-cover"
                            />
                        ) : null}
                    </View>
                    {category.title ? (
                        <Text className="text-sm text-center text-gray-900 mt-2">{category.title}</Text>
                    ) : null}
                </View>
            ))}
        </View>
    )
}
