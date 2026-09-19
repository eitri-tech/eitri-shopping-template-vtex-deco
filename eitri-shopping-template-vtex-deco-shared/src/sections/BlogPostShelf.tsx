import { View, Text, Image } from 'eitri-luminus'
import { useState, useEffect } from 'react'
import Eitri from 'eitri-bifrost'
import { useTranslation } from 'eitri-i18n'
import Loading from '../components/Loading/LoadingComponent'

// SwiperContent (inline) — carrossel horizontal simples.
function SwiperContent({ title, children }: { title?: string; children?: any }) {
	return (
		<View className='flex flex-col gap-2'>
			{title && (
				<View className='px-4'>
					<Text className='font-bold text-lg'>{title}</Text>
				</View>
			)}
			<View className='flex flex-row overflow-x-scroll'>
				<View className='flex flex-row gap-4 px-4'>{children}</View>
			</View>
		</View>
	)
}

interface BlogCardProps {
	postImg?: string
	post: any
	handleClick?: () => void
	textWidth?: string
}

function BlogCard({ postImg, post, handleClick, textWidth }: BlogCardProps) {
	const { t } = useTranslation()

	const category = post?._embedded['wp:term'][0][0].name.toUpperCase()
	const author = post?._embedded?.author[0].name
	const publishedDate = new Date(post?.date).toLocaleDateString('pt-BR')

	const excerpt = post.excerpt.rendered.replace('<p>', '').replace('</p>', '')
	return (
		<View
			key={post.id}
			className={`min-h-[290px] w-[283px]`}
			onClick={handleClick}>
			<View className='flex flex-col w-full rounded-2xl shadow-md'>
				<View className='relative'>
					<View className=''>
						<Image
							src={postImg ?? ''}
							className={`w-full h-[168px] rounded object-cover object-top`}
							alt={post.title.rendered}
						/>
					</View>
					<View className='px-2 bg-blue-500 rounded-full absolute bottom-2 left-4 w-fit'>
						<Text className='text-white !text-[14px]'>{category}</Text>
					</View>
				</View>
				<View className='flex flex-col h-full p-4'>
					<View className='h-[48px]'>
						<Text className='line-clamp-2 font-bold'>{post.title.rendered}</Text>
					</View>

					<View>
						<Text
							className={`line-clamp-3 max-w-[${
								textWidth || '231px'
							}] text-support-01 text-sm mb-[4px] font-normal`}>
							{excerpt}
						</Text>
					</View>

					<Text className='!text-[10px] mt-auto'>
						{author
							? t('blogCard.publishedByDate', { author, date: publishedDate })
							: t('blogCard.publishedDate', { date: publishedDate })}
					</Text>
				</View>
			</View>
		</View>
	)
}

export interface Props {
	/**
	 * @title Título da seção.
	 */
	title?: string
	/**
	 * @title URL base do WordPress.
	 */
	postUrl?: string
	/**
	 * @title Quantidade de posts.
	 */
	numberOfItems?: number
}

export default function BlogPostShelf({ title, postUrl, numberOfItems }: Props) {
	const { t } = useTranslation()

	const [posts, setPosts] = useState<any[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		getPosts()
	}, [])

	const getPosts = async () => {
		try {
			const _url = `${postUrl}/wp-json/wp/v2/posts?_embed&per_page=${numberOfItems}`
			const result = await Eitri.http.get(_url)
			setPosts(result.data)
		} catch (error) {
			console.error('Error fetching posts:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const navigateToSeeMore = () => {
		Eitri.navigation.navigate({ path: 'BlogHome', state: { blogUrl: postUrl } })
	}

	const navigateToBlog = (postId: any) => {
		Eitri.navigation.navigate({ path: 'BlogPost', state: { blogUrl: postUrl, postId: postId } })
	}

	return (
		<SwiperContent title={title}>
			{isLoading ? (
				<View className='w-screen flex flex-row justify-center'>
					<Loading />
				</View>
			) : (
				<>
					{posts.map(post => {
						const postImg = post._embedded['wp:featuredmedia'][0]?.source_url

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
