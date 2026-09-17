import { View } from 'eitri-luminus'
import SliderHero from './components/SliderHero'
import BannerList from './components/BannerList'
import FitOnScreen from './components/FitOnScreen'
import GridList from './components/GridList'
import RoundedBannerList from './components/RoundedBannerList'
import SingleBanner from './components/SingleBanner'
import { processActions } from '../../../services/ResolveCmsActions'

export default function Banner(props) {
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
