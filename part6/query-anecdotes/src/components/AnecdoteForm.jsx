import { useContext } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query"

import AnecdotesService from "../services/anecdotes"
import NotificationContext from '../NotificationContext';

const AnecdoteForm = () => {
  const { notificationDispatch } = useContext(NotificationContext)
  const queryClient = useQueryClient()

  const newAnecdoteMutation = useMutation({
    mutationFn: AnecdotesService.createNew,
    onSuccess: (newAnecdote) => {
      const anecdotes = queryClient.getQueryData(['anecdotes'])
      queryClient.setQueryData(['anecdotes'], [...anecdotes, newAnecdote])
      notificationDispatch({ type: 'CREATED', payload: newAnecdote.content })
      setTimeout(() => {
            notificationDispatch({ type: 'RESET' })
      }, 5000)
    },
    onError: (error) => {
      // Handle backend validation errors
      const errorMessage = error.message || 'too short anecdote, must have length 5 or more'
      notificationDispatch({ type: 'ERROR', payload: errorMessage })
      setTimeout(() => {
            notificationDispatch({ type: 'RESET' })
      }, 5000)
    }
  })

  const onCreate = (event) => {
    event.preventDefault()

    const content = event.target.anecdote.value
    event.target.anecdote.value = ''

    newAnecdoteMutation.mutate(content)
  }

  return (
    <div>
      <h3>create new</h3>
      <form onSubmit={onCreate}>
        <input name="anecdote" />
        <button type="submit">create</button>
      </form>
    </div>
  )
}

export default AnecdoteForm
