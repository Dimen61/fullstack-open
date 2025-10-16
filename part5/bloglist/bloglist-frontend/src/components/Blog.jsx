import { useState } from 'react'
import blogService from '../services/blogs'

const Blog = ({ blog, blogs, setBlogs, user }) => {
  const [showDetails, setShowDetails] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const toggleDetails = () => {
    setShowDetails(!showDetails)
  }

  const handleLike = async () => {
    const updatedBlog = await blogService.update(blog.id, { ...blog, likes: blog.likes + 1 })

    setBlogs(blogs.map(blog => blog.id === updatedBlog.id ? updatedBlog : blog))

    console.log('click like successfully')
    console.log(`updateBlog: ${updatedBlog}`)
  }

  const handleRemove = async () => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)) {
      await blogService.del(blog.id)

      setBlogs(blogs.filter(item => item.id !== blog.id))
      console.log('click remove successfully')
    }
  }

  return (
    <div style={blogStyle}>
      <div style={{ display: showDetails ? 'none' : '' }}>
        {blog.title} <button onClick={toggleDetails}>view</button>
      </div>

      <div style={{ display: showDetails ? '' : 'none' }}>
        <div>
          {blog.title} <button onClick={toggleDetails}>hide</button>
        </div>
        <div>
          {blog.url}
        </div>
        <div>
          {blog.likes} <button onClick={handleLike}>like</button>
        </div>
        <div>
          {blog.author}
        </div>

        {console.log(`user: ${JSON.stringify(user)}`)}
        {console.log(`blog.user: ${JSON.stringify(blog.user)}`)}

        {blog.user.username === user.username && (<button onClick={handleRemove}>remove</button>)}
      </div>
    </div>
  )
}

export default Blog
