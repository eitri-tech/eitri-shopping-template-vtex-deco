import { useEffect } from 'react'
import { Page, View, TextInput } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import {
	HeaderContentWrapper,
	HeaderSearchIcon,
	HeaderClose,
	BottomInset,
	TrackingService,
	DecoCMSContentRender,
	useRetractableBottomBar
} from 'eitri-shopping-template-vtex-deco-shared'
import type { RouteProps } from '../types/route'

interface CategoriesState {
	// Screen to return to on close (e.g. 'Wishlist' closes the app instead of going home).
	returnTo?: string
}

export default function Categories(props: RouteProps<CategoriesState>) {
	useRetractableBottomBar()

	const returnTo = props?.location?.state?.returnTo

	useEffect(() => {
		TrackingService.sendScreenView('Categorias', 'Categories')
		Eitri.navigation.addOnResumeListener(() => {
			TrackingService.sendScreenView('Categorias', 'Categories')
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const goToSearch = () => {
		Eitri.navigation.navigate({
			path: '/Search',
			state: { returnTo: 'Categories' }
		})
	}

	const goToHome = () => {
		if (returnTo === 'Wishlist') {
			return Eitri.close()
		}

		Eitri.bottomBar.changeTab({ index: 0 })
		Eitri.navigation.navigate({ path: '/Home', replace: true })
	}

	return (
		<Page title='Categorias'>
			<HeaderContentWrapper className='flex justify-between'>
				<TextInput
					placeholder='Encontre sua Joia'
					insideLeft={<HeaderSearchIcon />}
					className='flex-auto !bg-[#F6F4F7]'
					onClick={goToSearch}
				/>
				<HeaderClose onClick={goToHome} />
			</HeaderContentWrapper>

			<DecoCMSContentRender page='Categories' />

			<BottomInset />
			<View
				bottomInset={'auto'}
				className='w-full'
			/>
		</Page>
	)
}
