import { View } from 'eitri-luminus'
import SliderHero from './components/SliderHero'
import BannerList from './components/BannerList'
import FitOnScreen from './components/FitOnScreen'
import GridList from './components/GridList'
import RoundedBannerList from './components/RoundedBannerList'
import SingleBanner from './components/SingleBanner'
import { processActions } from '../../../services/ResolveCmsActions'

// Matches ResolveCmsActions.ts's local unexported CmsAction shape structurally — a BannerImage
// is passed directly to processActions as its SliderData argument.
export interface BannerAction {
	type?: string
	value?: string
	sort?: string
	title?: string
	banner?: string
	facets?: Array<{ key: string; value: string }>
	[key: string]: unknown
}

export interface BannerImage {
	imageUrl?: string
	externalImageUrl?: string
	subLabel?: string
	action?: BannerAction
	mktTag?: string
	[key: string]: unknown
}

export interface BannerSize {
	maxWidth?: number
	maxHeight?: number
	[key: string]: unknown
}

export interface BannerData {
	mode?: string
	mainTitle?: string
	images?: BannerImage[]
	autoPlay?: boolean
	aspectRatio?: string
	size?: BannerSize
	gap?: number
	autoSize?: string
	[key: string]: unknown
}

interface BannerProps {
	data: BannerData
}

export default function Banner(props: BannerProps) {
	const { data } = props
	const mode = data.mode

	if (mode === 'SliderHero') {
		return (
			<SliderHero
				data={data}
				onClick={processActions}
			/>
		)
	}
	if (mode === 'BannerList') {
		return (
			<BannerList
				data={data}
				onClick={processActions}
			/>
		)
	}
	if (mode === 'RoundedBannerList') {
		return (
			<RoundedBannerList
				data={data}
				onClick={processActions}
			/>
		)
	}
	if (mode === 'GridList') {
		return (
			<GridList
				data={data}
				onClick={processActions}
			/>
		)
	}
	if (mode === 'SingleBanner') {
		return (
			<SingleBanner
				data={data}
				onClick={processActions}
			/>
		)
	}
	if (mode === 'FitOnScreen') {
		return (
			<View>
				<FitOnScreen
					data={data}
					onClick={processActions}
				/>
			</View>
		)
	}
	return (
		<SliderHero
			data={data}
			onClick={processActions}
		/>
	)
}
