import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import { API_BASE_URL } from "../../config/api"

const BlogList = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/blog-posts`)
        const data = await response.json()
        setPosts(data.data || [])
      } catch (error) {
        console.error("Failed to fetch blog posts:", error)
        setPosts([])
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  return (
    <div className="min-h-screen flex flex-col w-full bg-shirting">
      <Header />
      <main className="flex-grow py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-caslon text-3xl md:text-4xl text-navy mb-8 text-center">Blog</h1>

          {loading ? (
            <p className="text-center text-flannel/70">Loading...</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-flannel/70">No posts yet - check back soon.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  to={`/blog/${post.slug}`}
                  className="block group border border-hairline  overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {post.coverImage && (
                    <div className="aspect-video overflow-hidden bg-paper">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h2 className="text-lg font-semibold text-ink mb-1">{post.title}</h2>
                    <p className="text-sm text-flannel/70 mb-2">
                      {post.author} • {new Date(post.publishedAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-flannel/80 line-clamp-2">
                      {post.body?.replace(/<[^>]+>/g, "").slice(0, 140)}...
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default BlogList
