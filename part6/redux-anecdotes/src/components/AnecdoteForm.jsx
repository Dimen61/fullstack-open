import { useDispatch } from "react-redux"

import { appendAnecdote } from "../reducers/anecdoteReducer"
import { setNotification } from "../reducers/notificationReducer"

const AnecdoteForm = () => {
  const dispatch = useDispatch()
  const handleCreate = async (event) => {
    event.preventDefault()

    console.log('Creating anecdote content:', event.target.content.value)
    dispatch(appendAnecdote(event.target.content.value))
    dispatch(setNotification(`You created '${event.target.content.value}'`, 5))
    event.target.content.value = ''
  }

  return (
    <>
      <h2>create new</h2>
      <form onSubmit={handleCreate}>
        <div>
          <input name="content" />
        </div>
        <button type="submit">create</button>
      </form>
    </>
  )
}

export default AnecdoteForm;
