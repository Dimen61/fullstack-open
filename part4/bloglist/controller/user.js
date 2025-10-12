const userRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

userRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', {
    title: 1,
    author: 1,
    url: 1,
  })
  response.json(users)
})

userRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body
  if (!username || !name || !password) {
    return response.status(400).json({ error: 'username, name, or password missing' })
  } else if (username.length < 3) {
    return response.status(400).json({ error: 'username must be at least 3 characters long' })
  } else if (password.length < 3) {
    return response.status(400).json({ error: 'password must be at least 3 characters long' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(request.body.password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash
  })
  const result = await user.save()

  response.status(201).json(result)
})

module.exports = userRouter
