import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export type ModalVariant =
  | null
  | 'changePhoto'
  | 'changeName'
  | 'changePhone'
  | 'addEmail'
  | 'changeEmail'
  | 'changePassword'
  | 'validatePhone'
  | 'validateEmail'

type ModalSliceProps = {
  variant: ModalVariant
}

const initialState: ModalSliceProps = {
  variant: null,
}

const settingsModalSlice = createSlice({
  name: 'settingsModal',
  initialState,
  reducers: {
    changeModal: (state, action: PayloadAction<ModalVariant>) => {
      state.variant = action.payload
    },
  },
})

export const { changeModal } = settingsModalSlice.actions
export default settingsModalSlice.reducer
