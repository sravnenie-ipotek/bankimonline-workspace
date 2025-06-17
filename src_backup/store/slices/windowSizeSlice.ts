import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  width: window.innerWidth,
  height: window.innerHeight,
}

const windowSizeSlice = createSlice({
  name: 'windowSize',
  initialState,
  reducers: {
    updateWindowSize: (state, action) => {
      state.width = action.payload.width
      state.height = action.payload.height
    },
  },
})

export const { updateWindowSize } = windowSizeSlice.actions

export default windowSizeSlice.reducer
