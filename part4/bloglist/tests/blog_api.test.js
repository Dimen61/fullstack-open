const { test, describe, after, before } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
  },
]

describe('blog api', () => {
  before(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(initialBlogs)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, initialBlogs.length)
  })

  test('blogs have id property', async () => {
    const response = await api.get('/api/blogs')

    response.body.forEach(blog => {
      assert.ok(blog.id)
    })
  })

  // New describe block for POST method tests
  describe('addition of a new blog', () => {
    test('succeeds with valid data and increases blog count', async () => {
      const newBlog = {
        title: 'Type Wars 2: Electric Boogaloo',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars2.html',
        likes: 12,
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const response = await api.get('/api/blogs')
      assert.strictEqual(response.body.length, initialBlogs.length + 1)
    })

    test('defaults likes to 0 if property is missing', async () => {
      const blogsAtStart = await Blog.find({})

      const newBlogWithoutLikes = {
        title: 'Browser can run javaScript',
        author: 'John Doe',
        url: 'http://example.com/javascript-in-browser',
      }

      const response = await api
        .post('/api/blogs')
        .send(newBlogWithoutLikes)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.likes, 0)

      const blogsAtEnd = await Blog.find({})
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length + 1)
    })

    test('fails with status code 400 if title is missing', async () => {
      const blogsAtStart = await Blog.find({})

      const newBlogWithoutTitle = {
        author: 'Jane Doe',
        url: 'http://example.com/missing-title',
        likes: 5,
      }

      await api
        .post('/api/blogs')
        .send(newBlogWithoutTitle)
        .expect(400)

      const blogsAtEnd = await Blog.find({})
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
    })

    test('fails with status code 400 if url is missing', async () => {
      const blogsAtStart = await Blog.find({})

      const newBlogWithoutUrl = {
        title: 'Blog without URL',
        author: 'John Smith',
        likes: 8,
      }

      await api
        .post('/api/blogs')
        .send(newBlogWithoutUrl)
        .expect(400)

      const blogsAtEnd = await Blog.find({})
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await Blog.find({})
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

      const blogsAtEnd = await Blog.find({})
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)

      const titles = blogsAtEnd.map(r => r.title)
      assert.ok(!titles.includes(blogToDelete.title))
    })

    test('fails with status code 204 if id is valid but does not exist', async () => {
      const blogsAtStart = await Blog.find({})
      const nonExistentId = '60c72b2f9b1d8c001c8e4e9f' // A valid-looking but non-existent ID

      await api
        .delete(`/api/blogs/${nonExistentId}`)
        .expect(204) // Expect 204 even if not found, as per current implementation

      const blogsAtEnd = await Blog.find({})
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length) // Count should not change
    })

    test('fails with status code 400 if id is malformed', async () => {
      const blogsAtStart = await Blog.find({})
      const invalidId = 'invalidIdFormat'

      await api
        .delete(`/api/blogs/${invalidId}`)
        .expect(400) // Expect 400 for malformed ID

      const blogsAtEnd = await Blog.find({})
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length) // Count should not change
    })
  })

  describe('update of a blog', () => {
    test('succeeds with status code 200 and updates blog information', async () => {
      const blogsAtStart = await Blog.find({})
      const blogToUpdate = blogsAtStart[0]

      const updatedInfo = {
        title: 'Updated Title for React Patterns',
        author: 'Michael Chan',
        url: 'https://reactpatterns.com/updated',
        likes: 10,
      }

      const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedInfo)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.title, updatedInfo.title)
      assert.strictEqual(response.body.url, updatedInfo.url)
      assert.strictEqual(response.body.likes, updatedInfo.likes)

      const blogsAtEnd = await Blog.find({})
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)

      const changedBlog = blogsAtEnd.find(blog => blog.id.toString() === blogToUpdate.id.toString())
      assert.strictEqual(changedBlog.title, updatedInfo.title)
      assert.strictEqual(changedBlog.url, updatedInfo.url)
      assert.strictEqual(changedBlog.likes, updatedInfo.likes)
    })

    test('fails with status code 400 if title is missing in update', async () => {
      const blogsAtStart = await Blog.find({})
      const blogToUpdate = blogsAtStart[0]

      const invalidUpdate = {
        author: 'Michael Chan',
        url: 'https://reactpatterns.com/updated',
        likes: 10,
      }

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(invalidUpdate)
        .expect(400)

      const blogsAtEnd = await Blog.find({})
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
    })

    test('fails with status code 400 if url is missing in update', async () => {
      const blogsAtStart = await Blog.find({})
      const blogToUpdate = blogsAtStart[0]

      const invalidUpdate = {
        title: 'Updated Title',
        author: 'Michael Chan',
        likes: 10,
      }

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(invalidUpdate)
        .expect(400)

      const blogsAtEnd = await Blog.find({})
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
    })

    test('fails with status code 404 if id is valid but does not exist', async () => {
      const blogsAtStart = await Blog.find({})
      const nonExistentId = '60c72b2f9b1d8c001c8e4e9f'

      const updateInfo = {
        title: 'Title for non-existent blog',
        author: 'Non-existent author',
        url: 'http://nonexistent.com',
        likes: 10,
      }

      await api
        .put(`/api/blogs/${nonExistentId}`)
        .send(updateInfo)
        .expect(404) // Expect 404 if not found

      const blogsAtEnd = await Blog.find({})
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
    })

    test('fails with status code 400 if id is malformed', async () => {
      const blogsAtStart = await Blog.find({})
      const invalidId = 'invalidIdFormat'

      const updateInfo = {
        title: 'Title for malformed ID',
        author: 'Malformed author',
        url: 'http://malformed.com',
        likes: 10,
      }

      await api
        .put(`/api/blogs/${invalidId}`)
        .send(updateInfo)
        .expect(400) // Expect 400 for malformed ID

      const blogsAtEnd = await Blog.find({})
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
    })
  })

  after(async () => {
    await mongoose.connection.close()
  })
})