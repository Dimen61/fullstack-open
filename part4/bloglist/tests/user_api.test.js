const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const mongoose = require('mongoose')
const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)

describe('User API', () => {
  beforeEach(async () => {
    await User.deleteMany({})
  })

  describe('when creating a new user', () => {
    test('succeeds with valid data', async () => {
      const newUser = {
        username: 'testuser',
        name: 'Test User',
        password: 'password123'
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await User.find({})
      assert.strictEqual(usersAtEnd.length, 1)
      assert.strictEqual(usersAtEnd[0].username, newUser.username)
    })

    test('fails with status code 400 if username is missing', async () => {
      const newUser = {
        name: 'Test User',
        password: 'password123'
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('username, name, or password missing'))

      const usersAtEnd = await User.find({})
      assert.strictEqual(usersAtEnd.length, 0)
    })

    test('fails with status code 400 if name is missing', async () => {
      const newUser = {
        username: 'testuser',
        password: 'password123'
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('username, name, or password missing'))

      const usersAtEnd = await User.find({})
      assert.strictEqual(usersAtEnd.length, 0)
    })

    test('fails with status code 400 if password is missing', async () => {
      const newUser = {
        username: 'testuser',
        name: 'Test User'
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('username, name, or password missing'))

      const usersAtEnd = await User.find({})
      assert.strictEqual(usersAtEnd.length, 0)
    })

    test('fails with status code 400 if username is too short (< 3 characters)', async () => {
      const newUser = {
        username: 'ab',
        name: 'Test User',
        password: 'password123'
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('username must be at least 3 characters long'))

      const usersAtEnd = await User.find({})
      assert.strictEqual(usersAtEnd.length, 0)
    })

    test('fails with status code 400 if password is too short (< 3 characters)', async () => {
      const newUser = {
        username: 'testuser',
        name: 'Test User',
        password: 'ab'
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('password must be at least 3 characters long'))

      const usersAtEnd = await User.find({})
      assert.strictEqual(usersAtEnd.length, 0)
    })

    test('fails with status code 400 if username is exactly 3 characters but password is too short', async () => {
      const newUser = {
        username: 'abc',
        name: 'Test User',
        password: 'ab'
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('password must be at least 3 characters long'))

      const usersAtEnd = await User.find({})
      assert.strictEqual(usersAtEnd.length, 0)
    })

    test('fails with status code 400 if password is exactly 3 characters but username is too short', async () => {
      const newUser = {
        username: 'ab',
        name: 'Test User',
        password: 'abc'
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('username must be at least 3 characters long'))

      const usersAtEnd = await User.find({})
      assert.strictEqual(usersAtEnd.length, 0)
    })

    test('succeeds with exactly 3 characters for both username and password', async () => {
      const newUser = {
        username: 'abc',
        name: 'Test User',
        password: 'abc'
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await User.find({})
      assert.strictEqual(usersAtEnd.length, 1)
      assert.strictEqual(usersAtEnd[0].username, newUser.username)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})
