import { useState } from 'react'
import { HeaderWishList } from 'eitri-shopping-template-vtex-deco-shared'
import { FiHeart } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import { addToWishlist, productOnWishlist, removeItemFromWishlist } from '../../services/customerService'

export default function Wishlist(props) {
	const { product, configLoaded } = props

	const [loadingWishlist, setLoadingWishlist] = useState(true)
	const [itemWishlistId, setItemWishlistId] = useState(-1)
	const [itemOnWishlist, setItemOnWishlist] = useState(false)

	useEffect(() => {
		if (product) {
			checkIfIsFavorite(product?.productId)
		}
	}, [product, configLoaded])

	const handleSaveFavorite = async () => {
		if (itemWishlistId === -1) {
			try {
				setItemOnWishlist(true)
				const result = await addToWishlist(product?.productId, product?.productName, product?.items[0]?.itemId)
				setItemWishlistId(result?.data?.addToList)
			} catch (e) {
				console.error('handleSaveFavorite: Error', e)
				setItemOnWishlist(false)
			}
		} else {
			try {
				setItemOnWishlist(false)
				await removeItemFromWishlist(itemWishlistId)
				setItemWishlistId(-1)
			} catch (e) {
				console.error('handleSaveFavorite: Error', e)
				setItemOnWishlist(true)
			}
		}
	}

	const checkIfIsFavorite = async productId => {
		setLoadingWishlist(true)
		const { inList, listId } = await productOnWishlist(productId)
		if (inList) {
			setItemWishlistId(listId)
			setItemOnWishlist(true)
		}
		setLoadingWishlist(false)
	}

	return (
		<View onClick={handleSaveFavorite}>
			{itemOnWishlist
				? <FaHeart size={28} className={'text-primary'} />
				: <FiHeart size={28} className={'text-primary'} />
			}
		</View>
	)
}
