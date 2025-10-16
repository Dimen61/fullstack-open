import axios from 'axios'
import login from './login'

const baseUrl = '/api/blogs'

const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

const create = async (newObject) => {
  const token =  login.getToken()
  const config = {
    headers: {
      Authorization: token
    }
  }
  const response = await axios.post(baseUrl, newObject, config)
  return response.data
}

const update = async (id, newObject) => {
  const token =  login.getToken()
  const config = {
    headers: {
      Authorization: token
    }
  }
  const response = await axios.put(`${baseUrl}/${id}`, newObject, config)
  return response.data
}

const del = async (id) => {
  const token =  login.getToken()
  const config = {
    headers: {
      Authorization: token
    }
  }
  const response = await axios.delete(`${baseUrl}/${id}`, config)
  return response.data
}

export default { getAll, create, update, del }
