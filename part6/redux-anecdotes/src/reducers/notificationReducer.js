import { createSlice } from '@reduxjs/toolkit'

const notificationSlice = createSlice({
  name: 'notification',
  initialState: '',
  reducers: {
    setNotificationMsg(state, action) {
      return action.payload;
    }
  },
});

const { setNotificationMsg } = notificationSlice.actions;

export const setNotification = (message, duration) => {
  return async(dispatch) => {
    dispatch(setNotificationMsg(message));
    setTimeout(() => dispatch(setNotificationMsg('')), duration * 1000);
  };
};

export default notificationSlice.reducer;
