const blogRouter = require('express').Router()
const Blog = require('../models/blog')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)
  const result = await blog.save()
  response.status(201).json(result)
})

blogRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }

  // Explicitly check for required fields, as Mongoose validators might not catch missing fields during update
  if (!body.title) {
    return response.status(400).json({ error: 'Title is required' })
  }
  if (!body.url) {
    return response.status(400).json({ error: 'URL is required' })
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true, runValidators: true, context: 'query' })

  if (!updatedBlog) {
    return response.status(404).end()
  }

  response.json(updatedBlog)
})

module.exports = blogRouter
