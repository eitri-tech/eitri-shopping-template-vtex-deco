import { View } from 'eitri-luminus'

export default function InfiniteScroll(props) {
	const { children, onScrollEnd, className } = props

	const [scrollEnded, setScrollEnded] = useState(false)

	useEffect(() => {
		const handleScroll = () => {
			if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500) {
				setScrollEnded(true)
			}
		}
		window.addEventListener('scroll', handleScroll)
		return () => {
			window.removeEventListener('scroll', handleScroll)
		}
	}, [])
	useEffect(() => {
		if (scrollEnded) {
			onScrollEnd()
			setScrollEnded(false)
		}
	}, [scrollEnded])
	return <View className={className}>{children}</View>
}
