export default function HeaderOffset(props) {
	const { topInset } = props
	const [height, setHeight] = useState(60)

	useEffect(() => {
		const el = document.getElementById('header-container')
		if (!el) return
		const observer = new ResizeObserver(([entry]) => {
			setHeight(entry.contentRect.height)
		})
		observer.observe(el)
		return () => observer.disconnect()
	}, [])

	return (
		<>
			{topInset && <View topInset={'auto'} />}
			<View style={{ minHeight: height }} />
		</>
	)
}
