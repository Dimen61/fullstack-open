const mongoose = require('mongoose')
const express = require('express')

const config = require('./utils/config')
const logger = require('./utils/logger')
const blogRouter = require('./controller/blog')
const middleware = require('./utils/middleware')

const app = express()
const mongoUri = config.MONGODB_URI

mongoose
  .connect(mongoUri)
  .then(() => {
      logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })

app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/blogs', blogRouter)

app.use(middleware.errorHandler)
app.use(middleware.unknownEndpoint)

module.exports = app
