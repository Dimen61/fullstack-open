import { useSelector, useDispatch } from 'react-redux'

import { voteAnecdote } from '../reducers/anecdoteReducer'
import { setNotification } from '../reducers/notificationReducer'

const AnecdoteList = () => {
  const dispatch = useDispatch()
  const anecdotes = useSelector(({ anecdotes, filter }) => {
    if (filter === '') {
      return [...anecdotes]
    }
    return anecdotes.filter(anecdote => anecdote.content.includes(filter))
  })
  console.log(`anecdotes: ${anecdotes}`)

  const handleVote = async (id) => {
    dispatch(voteAnecdote(id))
    dispatch(setNotification(`You voted for '${anecdotes.find(a => a.id === id).content}'`, 5))
  }

  return (
    <>
      {
        anecdotes
          .sort((a, b) => b.votes - a.votes)
          .map(anecdote => (
            <div key={anecdote.id}>
              <div>{anecdote.content}</div>
              <div>
                has {anecdote.votes}
                <button onClick={() => handleVote(anecdote.id)}>vote</button>
              </div>
            </div>
          ))
      }
    </>
  )
}

export default AnecdoteList
