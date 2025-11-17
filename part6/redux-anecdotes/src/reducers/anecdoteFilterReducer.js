import { createSlice } from '@reduxjs/toolkit'

const anecdoteFilterSlice = createSlice({
  name: 'anecdoteFilter',
  initialState: '',
  reducers: {
    setFilter: (state, action) => action.payload
  }
})

export const { setFilter } = anecdoteFilterSlice.actions
export default anecdoteFilterSlice.reducer
