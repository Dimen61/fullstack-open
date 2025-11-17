const baseUrl = 'http://localhost:3001/anecdotes'

const getAll = async () => {
  const response = await fetch(baseUrl)
  if (!response.ok) {
    throw new Error('Failed to fetch anecdotes')
  }
  return await response.json()
}

const createNew = async (content) => {
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, votes: 0}),
  }

  const response = await fetch(baseUrl, options)

  if (!response.ok) {
    throw new Error('Failed to create an anecdote')
  }

  return await response.json()
}

const vote = async (id) => {
  const response = await fetch(`${baseUrl}/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch anecdote')
  }

  const anecdote = await response.json()
  const updatedAnecdote = {
    ...anecdote,
    votes: anecdote.votes + 1
  }

  const options = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedAnecdote),
  }
  const putResponse = await fetch(`${baseUrl}/${id}`, options)
  if (!putResponse.ok) {
    throw new Error('Failed to vote for an anecdote')
  }

  return putResponse.json()
}

export default { getAll, createNew, vote }
