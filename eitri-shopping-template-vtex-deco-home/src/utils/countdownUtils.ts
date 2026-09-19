interface TimeRemaining {
	days: number
	hours: number
	minutes: number
}

export function getTimeRemaining(targetDate: Date | null | undefined): TimeRemaining | null {
	if (!targetDate) return null
	const now = new Date()
	const diff = targetDate.getTime() - now.getTime()
	if (!Number.isFinite(diff) || diff <= 0) return null
	const days = Math.floor(diff / (1000 * 60 * 60 * 24))
	const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
	const minutes = Math.floor((diff / (1000 * 60)) % 60)
	return { days, hours, minutes }
}

export function formatCountdown(remaining: TimeRemaining | null | undefined): string | null {
	if (!remaining) return null
	const parts: string[] = []
	if (remaining.days > 0) parts.push(`${remaining.days}d`)
	if (remaining.hours > 0 || remaining.days > 0) parts.push(`${String(remaining.hours).padStart(2, '0')}h`)
	parts.push(`${String(remaining.minutes).padStart(2, '0')}min`)
	return parts.join(' ')
}
