import { createContext, useReducer } from 'react';

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'CREATED': {
      const content = action.payload
      return `anecdote ${content} created`
    }
    case 'VOTED': {
      const content = action.payload
      return `anecdote ${content} voted`
    }
    case 'ERROR':
      return action.payload
    case 'RESET':
      return ''
    default:
      return state;
  }
};

const NotificationContext = createContext()

export const NotificationContextProvider = (props) => {
  const [notification, notificationDispatch] = useReducer(notificationReducer, '')

  return (
    <NotificationContext.Provider value={{ notification, notificationDispatch }}>
      { props.children }
    </NotificationContext.Provider>
  )
}

export default NotificationContext
