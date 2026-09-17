import { View, Text } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import SectionTitle from '../../SectionTitle/SectionTitle'

const parseContent = raw => {
	if (!raw) return null
	if (typeof raw === 'string') {
		try {
			return JSON.parse(raw)
		} catch {
			return null
		}
	}
	return raw
}

const STYLE_CLASS = {
	BOLD: 'font-bold',
	ITALIC: 'italic',
	UNDERLINE: 'underline',
	STRIKETHROUGH: 'line-through',
	CODE: 'font-mono bg-neutral-100 px-0.5 rounded text-xs'
}

const openUrl = async url => {
	try {
		console.log('url')
		const startUrl = /^https?:\/\//.test(url) ? url : `https://${url}`
		await Eitri.webFlow.start({
			startUrl,
			stopPattern: '/fakepattern',
			allowedDomains: ['*']
		})
	} catch (e) {
		console.log('RichText: erro ao abrir url', e)
	}
}

const getSegments = (text, ranges, entityRanges, entityMap) => {
	const points = new Set([0, text.length])

	;(ranges ?? []).forEach(({ offset, length }) => {
		points.add(offset)
		points.add(Math.min(offset + length, text.length))
	})
	;(entityRanges ?? []).forEach(({ offset, length }) => {
		points.add(offset)
		points.add(Math.min(offset + length, text.length))
	})

	const sorted = Array.from(points).sort((a, b) => a - b)

	return sorted.slice(0, -1).reduce((acc, start, i) => {
		const end = sorted[i + 1]
		const seg = text.slice(start, end)
		if (!seg) return acc

		const cls = (ranges ?? [])
			.filter(r => r.offset <= start && start < r.offset + r.length)
			.map(r => STYLE_CLASS[r.style] ?? '')
			.filter(Boolean)
			.join(' ')

		const entityRange = (entityRanges ?? []).find(e => e.offset <= start && start < e.offset + e.length)
		const entity = entityRange != null ? entityMap?.[entityRange.key] : null

		acc.push({ text: seg, cls, entity })
		return acc
	}, [])
}

function InlineText({ text, ranges, entityRanges, entityMap, base }) {
	const segments = getSegments(text, ranges, entityRanges, entityMap)
	const hasLinks = segments.some(s => s.entity?.type === 'LINK')

	if (!hasLinks) {
		return (
			<Text className={base}>
				{segments.map((seg, i) =>
					seg.cls ? (
						<Text
							key={i}
							className={seg.cls}>
							{seg.text}
						</Text>
					) : (
						seg.text
					)
				)}
			</Text>
		)
	}

	return (
		<View>
			{segments.map((seg, i) => {
				if (seg.entity?.type === 'LINK') {
					const url = seg.entity.data?.url
					const cls = [base, 'text-primary underline', seg.cls].filter(Boolean).join(' ')
					return (
						<View
							className='inline'
							key={i}
							onClick={() => openUrl(url)}>
							<Text className={`${cls} whitespace-pre`}>{seg.text}</Text>
						</View>
					)
				}
				return (
					<Text
						key={i}
						className={[base, seg.cls, 'whitespace-pre'].filter(Boolean).join(' ')}>
						{seg.text}
					</Text>
				)
			})}
		</View>
	)
}

const HEADER_CLASS = {
	'header-one': 'text-2xl font-bold text-gray-800',
	'header-two': 'text-xl font-bold text-gray-800',
	'header-three': 'text-lg font-bold text-gray-700',
	'header-four': 'text-base font-bold text-gray-700',
	'header-five': 'text-sm font-bold text-gray-700',
	'header-six': 'text-xs font-bold text-gray-700'
}

const renderBlock = (block, index, blocks, entityMap) => {
	const { text, type, inlineStyleRanges: ranges, entityRanges, depth = 0 } = block
	const indent = depth > 0 ? `pl-${depth * 6}` : ''

	const inline = base => (
		<InlineText
			key={index}
			text={text}
			ranges={ranges}
			entityRanges={entityRanges}
			entityMap={entityMap}
			base={[base, indent].filter(Boolean).join(' ')}
		/>
	)

	if (!text && (type === 'unstyled' || type in HEADER_CLASS))
		return (
			<View
				key={index}
				className='h-2'
			/>
		)

	if (type in HEADER_CLASS) return inline(HEADER_CLASS[type])

	if (type === 'blockquote')
		return (
			<View
				key={index}
				className={['border-l-4 border-neutral-300 pl-3', indent].filter(Boolean).join(' ')}>
				<InlineText
					text={text}
					ranges={ranges}
					entityRanges={entityRanges}
					entityMap={entityMap}
					base='italic text-neutral-500 text-sm'
				/>
			</View>
		)

	if (type === 'unordered-list-item')
		return (
			<View
				key={index}
				className={['flex flex-row gap-2 items-start', indent].filter(Boolean).join(' ')}>
				<Text className='text-sm text-neutral-700'>•</Text>
				<InlineText
					text={text}
					ranges={ranges}
					entityRanges={entityRanges}
					entityMap={entityMap}
					base='text-sm text-neutral-700'
				/>
			</View>
		)

	if (type === 'ordered-list-item') {
		let num = 1
		for (let i = index - 1; i >= 0 && blocks[i].type === 'ordered-list-item' && blocks[i].depth === depth; i--)
			num++
		return (
			<View
				key={index}
				className={['flex flex-row gap-2 items-start', indent].filter(Boolean).join(' ')}>
				<Text className='text-sm text-neutral-700'>{num}.</Text>
				<InlineText
					text={text}
					ranges={ranges}
					entityRanges={entityRanges}
					entityMap={entityMap}
					base='text-sm text-neutral-700'
				/>
			</View>
		)
	}

	if (type === 'code-block')
		return (
			<View
				key={index}
				className={['bg-neutral-100 rounded px-3 py-2', indent].filter(Boolean).join(' ')}>
				<Text className='font-mono text-xs text-neutral-800'>{text}</Text>
			</View>
		)

	return inline('text-sm text-neutral-700')
}

export default function RichText(props) {
	const { data } = props

	const content = parseContent(data?.content)

	if (!content?.blocks?.length && !data?.title) return null

	return (
		<View>
			<SectionTitle title={data?.title} />
			<View className='px-4 flex flex-col gap-1'>
				{content?.blocks?.map((block, i, all) => renderBlock(block, i, all, content.entityMap))}
			</View>
		</View>
	)
}
