import { View, Image } from 'eitri-luminus'
import { useState, useEffect } from 'react'

const THUMBNAIL_SIZE = 'calc((100vw - 28px) / 4)'

export default function ImageGallery(props) {
  const { currentSku } = props

  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    setSelectedIndex(0)
  }, [currentSku?.itemId])

  if (!currentSku?.images?.length) return null

  const safeIndex = Math.min(selectedIndex, currentSku.images.length - 1)
  const selectedImage = currentSku.images[safeIndex]

  return (
    <View orientation='column'>
      <View className='overflow-hidden relative' width='100vw'>
        <Image
          key={safeIndex}
          pinchZoom
          zoomMaxScale={8}
          fadeIn={300}
          src={selectedImage.imageUrl}
          width='100vw'
        />
      </View>

      {currentSku.images.length > 1 && (
        <View
          className='flex flex-row overflow-x-auto'>
          {currentSku.images.map((item, index) => (
            <View
              key={`${item.imageUrl}-${index}`}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 border-2 rounded ${
                safeIndex === index ? 'border-primary' : 'border-transparent'
              }`}
              width={THUMBNAIL_SIZE}
              height={THUMBNAIL_SIZE}>
              <Image
                src={item.imageUrl}
                width={THUMBNAIL_SIZE}
                height={THUMBNAIL_SIZE}
                style={{ objectFit: 'cover' }}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
