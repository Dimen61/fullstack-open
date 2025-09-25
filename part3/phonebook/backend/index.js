require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('../frontend/dist'))

morgan.token('body', (req, response) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const Person = require('./models/person')

app.get('/', (request, response) => {
  response.send('<h1>Phonebook Homepage</h1>')
})

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(persons => {
    response.json(persons)
  }).catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id).then(() => {
    response.status(204).end()
  }).catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const newPerson = request.body
  console.info('person:', newPerson)

  if (!newPerson.number) {
    return response.status(400).json({
      error: 'number is missing'
    })
  } else if (!newPerson.name) {
    return response.status(400).json({
      error: 'name is missing'
    })
  } else {
    Person.find({ name: newPerson.name }).then(persons => {
      if (persons.length > 0) {
        return response.status(400).json({
          error: 'name must be unique'
        })
      }
    }).catch(error => next(error))
  }

  Person.create(newPerson).then(person => {
    console.info(`response person: ${person}`)

    response.status(201).json(person)
  }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const newPerson = request.body
  console.info('person:', newPerson)

  if (!newPerson.number) {
    return response.status(400).json({
      error: 'number is missing'
    })
  } else if (!newPerson.name) {
    return response.status(400).json({
      error: 'name is missing'
    })
  } else {
    Person.findByIdAndUpdate(request.params.id, newPerson).then(person => {
      if (!person) {
        return response.status(404).end()
      }

      response.status(200).json(person)
    }).catch(error => next(error))
  }
})

app.get('/info', (request, response, next) => {
  const date = new Date()
  console.log(`Current time: ${date}`)

  Person
    .countDocuments({})
    .then(count => {
      response.send(
        `<p>Phonebook has info for ${count} people</p>` +
        `<p>${date}</p>`
      )
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT)
console.info(`Server running on port ${PORT}`)
