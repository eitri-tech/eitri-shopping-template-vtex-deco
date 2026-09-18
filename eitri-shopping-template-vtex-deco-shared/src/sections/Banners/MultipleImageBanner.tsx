import { View } from 'eitri-luminus'
import { processActions } from '../../services/ResolveCmsActions'
import SliderHero from './components/SliderHero'
import BannerList from './components/BannerList'
import RoundedBannerList from './components/RoundedBannerList'
import GridList from './components/GridList'
import SingleBanner from './components/SingleBanner'
import FitOnScreen from './components/FitOnScreen'
import type { BannerImage, BannerMode, BannerSize } from '../types'

export interface Props {
	images: BannerImage[]
	/**
	 * @title Modo de exibição.
	 */
	mode?: BannerMode
	/**
	 * @title Reprodução automática.
	 */
	autoPlay?: boolean
	/**
	 * @title Tempo de exibição de cada banner (em segundos).
	 * @description Usado quando a reprodução automática está ativa. Padrão: 5 segundos.
	 */
	autoPlayTimeout?: number
	/**
	 * @title Proporção (ex.: "4:3", "791:1280").
	 */
	aspectRatio?: string
	/**
	 * @title Título principal.
	 */
	mainTitle?: string
	size?: BannerSize
	/**
	 * @title Espaçamento entre itens (px).
	 */
	gap?: number
	autoSize?: string
}

export default function MultipleImageBanner(props: Props) {
	const data = { ...props }
	const mode = data.mode

	switch (mode) {
		case 'BannerList':
			return (
				<BannerList
					data={data}
					onClick={processActions}
				/>
			)
		case 'RoundedBannerList':
			return (
				<RoundedBannerList
					data={data}
					onClick={processActions}
				/>
			)
		case 'GridList':
			return (
				<GridList
					data={data}
					onClick={processActions}
				/>
			)
		case 'SingleBanner':
			return (
				<SingleBanner
					data={data}
					onClick={processActions}
				/>
			)
		case 'FitOnScreen':
			return (
				<View>
					<FitOnScreen
						data={data}
						onClick={processActions}
					/>
				</View>
			)
		// `FullScreen` renderiza como SliderHero (imagem única full-bleed),
		// preservando o fallback do CMS legado (Banner.jsx não tratava esse modo).
		case 'SliderHero':
		case 'FullScreen':
		default:
			return (
				<SliderHero
					data={data}
					onClick={processActions}
				/>
			)
	}
}
