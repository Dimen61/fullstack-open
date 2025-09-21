import axios from "axios"

// const personsInitURL = 'http://localhost:3001/api/persons'
const personsInitURL = '/api/persons'

const createPersonOnBackend = (name, number) => {
  const newPhoneNumber = {
    name: name,
    number: number
  }

  console.info('create person...')

  return axios
    .post(personsInitURL, newPhoneNumber)
    .then(response => response.data)
}

const getPersonsOnBackend = () => {
  console.info('get persons...')

  return axios
    .get(personsInitURL)
    .then(response => response.data)
}

const deletePersonOnBackend = (id) => {
  console.info(`delete person ${id}...`)

  return axios
    .delete(`${personsInitURL}/${id}`)
    .then(response => response.data)
}

const updatePersonOnBackend = (id, newPerson) => {
  console.info('update person...')

  return axios
    .put(`${personsInitURL}/${id}`, newPerson)
    .then(response => response.data)

}

export default {
  createPersonOnBackend,
  getPersonsOnBackend,
  deletePersonOnBackend,
  updatePersonOnBackend
}
