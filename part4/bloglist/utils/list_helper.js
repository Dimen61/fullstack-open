const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (!blogs || blogs.length === 0) return null

  const maxLikes = Math.max(...(blogs.map(blog => blog.likes)))
  const ret = blogs.find(blog => blog.likes === maxLikes)

  return ret
}

const mostBlogs = (blogs) => {
  if (!blogs || blogs.length === 0) return null

  const authors = blogs.map(blog => blog.author)
  const authorCounts = authors.reduce((acc, author) => {
    acc[author] = (acc[author] || 0) + 1
    return acc
  }, {})

  const maxBlogs = Math.max(...Object.values(authorCounts))
  const topAuthors = Object.keys(authorCounts).filter(author => authorCounts[author] === maxBlogs)

  return { author: topAuthors[0], blogs: maxBlogs }
}

//Define a function called mostLikes that receives an array of blogs as its parameter. The function returns the author whose blog posts have the largest amount of likes. The return value also contains the total number of likes that the author has received
const mostLikes = (blogs) => {
  if (!blogs || blogs.length === 0) return null

  const authorLikes = blogs.reduce((acc, blog) => {
    acc[blog.author] = (acc[blog.author] || 0) + blog.likes
    return acc
  }, {})

  const maxLikes = Math.max(...Object.values(authorLikes))
  const topAuthors = Object.keys(authorLikes).filter(author => authorLikes[author] === maxLikes)

  return { author: topAuthors[0], likes: maxLikes }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
