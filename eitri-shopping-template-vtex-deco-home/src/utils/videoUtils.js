export function resolveVideoProps(url) {
	if (!url) return null

	const youTubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/)
	if (youTubeMatch) {
		return { youTubeId: youTubeMatch[1] }
	}

	if (/vimeo\.com/.test(url)) {
		const embedMatch = url.match(/vimeo\.com\/video\/(\d+)/)
		if (embedMatch) return { vimeoId: embedMatch[1] }

		const standardMatch = url.match(/vimeo\.com\/(\d+)(?:\/|\?|$)/)
		if (standardMatch) return { vimeoId: standardMatch[1] }

		const iframeMatch = url.match(/src="[^"]*vimeo\.com\/video\/(\d+)/)
		if (iframeMatch) return { vimeoId: iframeMatch[1] }
	}

	return { source: url }
}
