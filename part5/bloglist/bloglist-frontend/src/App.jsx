import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'

const MsgStatus = {
  SUCCESS: "success",
  ERROR: "error",
}

const Notification = ({ msg, msgStatus }) => {
  const successStyle = {
    color: "green",
    background: "lightgreymsgStatus",
    fontSize: 20,
    borderStyle: "solid",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  }

  const errorStyle = {
    color: "red",
    background: "lightgrey",
    fontSize: 20,
    borderStyle: "solid",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  }

  if (msg === null) {
    return null
  }

  return (
    <div style={MsgStatus.SUCCESS === msgStatus ? successStyle : errorStyle}>
      {msg}
    </div>
  )
}

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')
  const [msg, setMsg] = useState(null)
  const [msgStatus, setMsgStatus] = useState(null)

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      loginService.setToken(user.token)
    }
  }, [])

  const handleLogin = async event => {
    event.preventDefault()

    try {
      const user = await loginService.login({
        username, password
      })

      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )

      setUser(user)
      setUsername('')
      setPassword('')

      setMsg('successful login')
      setMsgStatus(MsgStatus.SUCCESS)
      setTimeout(() => {
        setMsg(null)
        setMsgStatus(null)
      }, 5000)

      console.log('successful login')
    } catch (exception) {
      setMsg('wrong username or password')
      setMsgStatus(MsgStatus.ERROR)
      setTimeout(() => {
        setMsg(null)
      }, 5000)
    }
  }

  const handleLogout = async () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
  }

  const loginForm = () => {
    return (
      <div>
        <h2>log in to application</h2>

        <Notification msg={msg} msgStatus={msgStatus} />

        <form onSubmit={handleLogin}>
          <label>
            username
            <input
              type="text"
              value={username}
              onChange={({ target }) => setUsername(target.value)}
            />
          </label>

          <label>
            password
            <input
              type="password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
          </label>

          <button type="submit">login</button>
        </form>
      </div>
    )
  }

  const handleNewBlog = async (event) => {
    event.preventDefault()
    const blogObject = {
      title: title,
      author: author,
      url: url,
    }
    try {
      await blogService.create(blogObject)
      setTitle('')
      setAuthor('')
      setUrl('')

      setMsg(`a new blog ${blogObject.title} by ${blogObject.author} added`)
      setMsgStatus(MsgStatus.SUCCESS)
      setTimeout(() => {
        setMsg(null)
        setMsgStatus(null)
      }, 5000)
    } catch (exception) {
      setMsg('error creating a new blog')
      setMsgStatus(MsgStatus.ERROR)
      setTimeout(() => {
        setMsg(null)
        setMsgStatus(null)
      }, 5000)
    }
  }

  const newBlogForm = () => {
    return (
      <div>
        <h2>create new</h2>

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
      </div>
    )
  }

  return (
    <>
    {!user && loginForm()}
    {user && (
      <div>
        <h2>blogs</h2>

        <Notification msg={msg} msgStatus={msgStatus} />

        <div>
          {user.name} logged in <button onClick={handleLogout}>logout</button>
        </div>

        {newBlogForm()}

        <br />

        {blogs.map(blog =>
          <Blog key={blog.id} blog={blog} />
        )}
      </div>
    )}
    </>
  )
}

export default App
