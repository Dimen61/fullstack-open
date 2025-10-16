import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import Notification, { MsgStatus } from './components/Notification'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState(null)
  const [msgStatus, setMsgStatus] = useState(null)

  const blogFormRef = useRef()

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
    } catch {
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

          <div>
            <h2>create new</h2>
            <Togglable buttonLabel="create new blog" ref={blogFormRef}>
              <BlogForm setMsg={setMsg} setMsgStatus={setMsgStatus} blogs={blogs} setBlogs={setBlogs} />
            </Togglable>
          </div>

          <br />

          {blogs
            .sort((a, b) => b.likes - a.likes)
            .map(blog =>
              <Blog key={blog.id} blog={blog} blogs={blogs} setBlogs={setBlogs} user={user} />
            )}
        </div>
      )}
    </>
  )
}

export default App
