const jwt = require('jsonwebtoken')
const blogRouter = require('express').Router()

const Blog = require('../models/blog')
const User = require('../models/user')
const middleware = require('../utils/middleware')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {
    username: 1,
    name: 1
  })
  response.json(blogs)
})

blogRouter.post('/', middleware.userExtractor, async (request, response) => {
  const { title, author, url, likes } = request.body

  console.log(`request.user.id: ${request.user.id}`)
  const creator = await User.findById(request.user.id)

  const blog = new Blog({ title, author, url, likes, user: creator._id });
  creator.blogs.push(blog._id)
  await creator.save()

  const result = await blog.save()
  const populatedResult = await result.populate('user', { username: 1, name: 1 })
  response.status(201).json(populatedResult)
})

blogRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).json({
      error: 'blog not found'
    })
  } else if (blog.user.toString() !== request.user.id.toString()) {
    return response.status(401).json({
      error: 'token missing or invalid'
    })
  }

  await blog.deleteOne()
  response.status(204).end()
})

blogRouter.put('/:id', middleware.userExtractor, async (request, response) => {
  const body = request.body

  // Explicitly check for required fields, as Mongoose validators might not catch missing fields during update
  if (!body.title) {
    return response.status(400).json({ error: 'Title is required' })
  } else if (!body.url) {
    return response.status(400).json({ error: 'URL is required' })
  }

  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).json({ error: 'Blog not found' })
  } else if (blog.user.toString() !== request.user.id.toString()) {
    return response.status(401).json({ error: 'No authorization to change the blog' })
  }

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
    },
    { new: true, runValidators: true, context: 'query' }
  )

  if (!updatedBlog) {
    return response.status(404).end()
  }

  response.json(updatedBlog)
})

module.exports = blogRouter
