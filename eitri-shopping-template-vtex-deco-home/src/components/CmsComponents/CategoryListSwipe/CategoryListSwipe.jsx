import { View } from 'eitri-luminus'
import { resolveNavigation } from '../../../services/NavigationService'
import CategoryPageItem from './components/CategoryPageItem'
import { processActions } from '../../../services/ResolveCmsActions'
export default function CategoryListSwipe(props) {
	const { data } = props

	const openItem = item => {
		processActions(item)
	}

	return (
		<View className='flex flex-col p-4 gap-4 w-screen max-w-screen overflow-x-hidden'>
			{data?.content &&
				data?.content?.map(item => (
					<CategoryPageItem
						key={item.title}
						item={item}
						goToItem={openItem}
					/>
				))}
			<View
				bottomInset={'auto'}
				className='w-full'
			/>
		</View>
	)
}
