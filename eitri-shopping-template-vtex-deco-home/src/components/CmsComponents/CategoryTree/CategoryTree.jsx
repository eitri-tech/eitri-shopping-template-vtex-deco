import Eitri from 'eitri-bifrost'
import { Text, View } from 'eitri-luminus'
import { Vtex } from 'eitri-shopping-vtex-shared'
import { resolveNavigation } from '../../../services/NavigationService'
import ListWithImages from './components/ListWithImages'
import SimpleList from './components/SimpleList'
export default function CategoryTree(props) {
	const { data } = props
	const [currentShelf, setCurrentShelf] = useState(null)
	const legacySearch = Vtex?.configs?.searchOptions?.legacySearch
	useEffect(() => {
		if (data?.shelves) {
			setCurrentShelf(data.shelves[0])
		}
	}, [data?.shelves])
	const onChooseShelf = shelf => {
		setCurrentShelf(shelf)
	}
	const chooseCategory = category => {
		if (legacySearch) {
			console.log('chooseCategory >> legacySearch >>', JSON.stringify(category))
			Eitri.navigation.navigate({
				path: 'ProductCatalog',
				state: {
					facets: category.facets,
					title: category.title
				}
			})
			return
		}
		resolveNavigation(category.facets)
	}
	return (
		<>
			{(data.shelves?.length > 1 || (data.shelves?.length === 1 && data.shelves[0].title)) && (
				<View className='overflow-x-auto flex px-8'>
					{data.shelves?.map(shelf => (
						<>
							{shelf.title && (
								<View
									minWidth='fit-content'
									key={shelf.title}
									onClick={() => onChooseShelf(shelf)}
									backgroundColor={
										shelf.title === currentShelf?.title ? 'secondary-500' : 'neutral-100'
									}
									borderColor={shelf.title === currentShelf?.title ? 'secondary-500' : 'neutral-300'}
									className='py-1 border'>
									<Text color={shelf.title === currentShelf?.title ? 'secondary-500' : 'neutral-300'}>
										{shelf.title}
									</Text>
								</View>
							)}
						</>
					))}
				</View>
			)}
			{currentShelf &&
				(currentShelf.showAsSimpleItem ? (
					<SimpleList
						currentShelf={currentShelf}
						chooseCategory={chooseCategory}
					/>
				) : (
					<ListWithImages
						currentShelf={currentShelf}
						chooseCategory={chooseCategory}
					/>
				))}
		</>
	)
}
