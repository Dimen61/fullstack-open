import { useState } from 'react'
import blogService from '../services/blogs'
import { MsgStatus } from './Notification'

const BlogForm = ({ setMsg, setMsgStatus, blogs, setBlogs }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const handleNewBlog = async (event) => {
    event.preventDefault()
    const blogObject = {
      title: title,
      author: author,
      url: url,
    }

    try {
      const blog = await blogService.create(blogObject)
      setTitle('')
      setAuthor('')
      setUrl('')

      setBlogs([...blogs, blog])

      setMsg(`a new blog ${blogObject.title} by ${blogObject.author} added`)
      setMsgStatus(MsgStatus.SUCCESS)
      setTimeout(() => {
        setMsg(null)
        setMsgStatus(null)
      }, 5000)
    } catch {
      setMsg('error creating a new blog')
      setMsgStatus(MsgStatus.ERROR)
      setTimeout(() => {
        setMsg(null)
        setMsgStatus(null)
      }, 5000)
    }
  }

  return (
    <form onSubmit={handleNewBlog}>
      <label>
        title
        <input
          type="text"
          value={title}
          onChange={({ target }) => setTitle(target.value)}
        />
      </label>

      <label>
        author
        <input
          type="text"
          value={author}
          onChange={({ target }) => setAuthor(target.value)}
        />
      </label>

      <label>
        url
        <input
          type="text"
          value={url}
          onChange={({ target }) => setUrl(target.value)}
        />
      </label>

      <button type="submit">create</button>
    </form>
  )
}

export default BlogForm
