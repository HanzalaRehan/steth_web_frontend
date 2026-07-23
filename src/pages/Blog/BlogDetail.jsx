import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import { API_BASE_URL } from "../../config/api"

const BlogDetail = () => {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true)
      setNotFound(false)
      try {
        const response = await fetch(`${API_BASE_URL}/api/blog-posts/${slug}`)
        if (response.status === 404) {
          setNotFound(true)
          return
        }
        const data = await response.json()
        setPost(data.data)
      } catch (error) {
        console.error("Failed to fetch blog post:", error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [slug])

  return (
    <div className="min-h-screen flex flex-col w-full bg-white">
      <Header />
      <main className="flex-grow py-16 px-4">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : notFound || !post ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">This post doesn't exist.</p>
              <Link to="/blog" className="text-black underline">Back to Blog</Link>
            </div>
          ) : (
            <article>
              {post.coverImage && (
                <div className="aspect-video overflow-hidden rounded-2xl mb-6 bg-gray-100">
                  <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                </div>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
              <p className="text-sm text-gray-500 mb-8">
                {post.author} • {new Date(post.publishedAt).toLocaleDateString()}
              </p>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.body}</p>
              <Link to="/blog" className="inline-block mt-10 text-sm text-black underline">
                ← Back to Blog
              </Link>
            </article>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default BlogDetail
