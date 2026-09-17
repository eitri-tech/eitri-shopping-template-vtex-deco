import { View, Text } from 'eitri-luminus'
import { resolveNavigation } from '../../../services/NavigationService'
import CategoryPageItem from './components/CategoryPageItem'
import { processActions } from '../../../services/ResolveCmsActions'
export default function CategoryListSwipe(props) {
	const { data } = props

	const openItem = item => {
		processActions(item)
	}

	return (
		<View className='flex flex-col w-screen max-w-screen overflow-x-hidden bg-white mt-2'>
			<Text className='text-xl font-bold px-4 py-2'>Categorias</Text>
			<View className='flex flex-col w-screen max-w-screen overflow-x-hidden mb-2'>
				{data?.content &&
					data?.content?.map(item => (
						<CategoryPageItem
							key={item.title}
							item={item}
							goToItem={openItem}
						/>
					))}
			</View>
		</View>
	)
}
