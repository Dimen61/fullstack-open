const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('../frontend/dist'))

morgan.token('body', (req, response) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
    {
      "id": "1",
      "name": "Arto Hellas",
      "number": "040-123456"
    },
    {
      "id": "2",
      "name": "Ada Lovelace",
      "number": "39-44-5323523"
    },
    {
      "id": "3",
      "name": "Dan Abramov",
      "number": "12-43-234345"
    },
    {
      "id": "4",
      "name": "Mary Poppendieck",
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
  response.send('<h1>Phonebook Homepage</h1>')
})

app.get('/api/persons', (request, respones) => {
  respones.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(item => item.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const newId = Math.floor(Math.random() * 1000000000000).toString()
  const newPerson = request.body

  if (!newPerson.number) {
    return response.status(400).json({
      error: 'number is missing'
    })
  } else if (!newPerson.name) {
    return response.status(400).json({
      error: 'name is missing'
    })
  } else if (persons.filter(person => person.name === newPerson.name).length > 0) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  persons = persons.concat({ id: newId, ...newPerson })

  response.status(201).json({ id: newId, ...newPerson })
})

app.get('/info', (request, response) => {
  const date = new Date()
  console.log(`Current time: ${date}`)

  response.send(
    `<p>Phonebook has info for ${persons.length} people</p>` +
    `<p>${date}</p>`
  )
})

const PORT = 3001
app.listen(PORT)
console.info(`Server running on port ${PORT}`)
