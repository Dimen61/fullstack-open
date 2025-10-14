import axios from 'axios'
const baseUrl = '/api/login'

let token = null

const setToken = (newToken) => {
  token = `bearer ${newToken}`
}

const login = async (user) => {
  const response = await axios.post(baseUrl, user)
  return response.data
}

export default { login, setToken }
