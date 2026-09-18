import { useEffect, useState } from 'react'
import { Text, View } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import BlogCard from './BlogCard'
import { Loading } from 'eitri-shopping-template-vtex-deco-shared'
import SwiperContent from '../../SwiperContent/SwiperContent'
import { useTranslation } from 'eitri-i18n'

// WordPress REST API post shape (`_embed`ded) — an external blog integration, not a VTEX
// payload, so this stays local rather than living in types/vtex.ts.
export interface WpPost {
	id: string | number
	date?: string
	title?: { rendered?: string }
	excerpt?: { rendered?: string }
	_embedded?: {
		'wp:term'?: Array<Array<{ name?: string }>>
		author?: Array<{ name?: string }>
		'wp:featuredmedia'?: Array<{ source_url?: string }>
		[key: string]: unknown
	}
	[key: string]: unknown
}

interface BlogPostShelfData {
	postUrl?: string
	numberOfItems?: number
	title?: string
}

interface BlogPostShelfProps {
	data: BlogPostShelfData
}

export default function BlogPostShelf(props: BlogPostShelfProps) {
	const { data } = props
	const { t } = useTranslation()

	const [posts, setPosts] = useState<WpPost[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const url = data?.postUrl

	useEffect(() => {
		getPosts()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const getPosts = async () => {
		try {
			const _url = `${url}/wp-json/wp/v2/posts?_embed&per_page=${data?.numberOfItems}`
			const result = (await Eitri.http.get(_url)) as { data?: WpPost[] }
			setPosts(result.data ?? [])
		} catch (error) {
			console.error('Error fetching posts:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const navigateToSeeMore = () => {
		Eitri.navigation.navigate({ path: 'BlogHome', state: { blogUrl: url } })
	}

	const navigateToBlog = (postId: string | number) => {
		Eitri.navigation.navigate({ path: 'BlogPost', state: { blogUrl: url, postId: postId } })
	}

	return (
		<SwiperContent title={data.title}>
			{isLoading ? (
				<View className='w-screen flex flex-row justify-center'>
					<Loading />
				</View>
			) : (
				<>
					{posts.map(post => {
						const postImg = post._embedded?.['wp:featuredmedia']?.[0]?.source_url

						return (
							<BlogCard
								key={post.id}
								postImg={postImg}
								post={post}
								handleClick={() => navigateToBlog(post.id)}
							/>
						)
					})}

					<View
						className='flex flex-col justify-center items-center w-[120px] h-full p-4'
						onClick={navigateToSeeMore}>
						<Text className='text-primary-500 font-bold mb-[4px]'>{t('blogPostShelf.seeMore')}</Text>
						<Text className='text-primary-500 font-bold'>+</Text>
					</View>
				</>
			)}
		</SwiperContent>
	)
}
