import { ReactNode } from 'react'

import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { RootState } from '@src/store'

interface IDialogState {
  title: string | null
  onOk: (() => void) | null
  okTitle: string | null
  onCancel: (() => void) | null
  onClose: (() => void) | null
  cancelTitle: string | null
  isVisible: boolean
  isCloseIcon: boolean
  content: ReactNode | null
  maxWidth: string | null
}

const initialState: IDialogState = {
  title: null,
  onOk: null,
  okTitle: null,
  onCancel: null,
  onClose: null,
  cancelTitle: null,
  isVisible: false,
  content: null,
  isCloseIcon: false,
  maxWidth: null,
}

const dialogSlice = createSlice({
  name: 'dialog',
  initialState,
  reducers: {
    setDialog: (state, action: PayloadAction<Partial<IDialogState>>) => {
      return {
        ...state,
        ...action.payload,
        isVisible: true,
      }
    },
    cancelDialog: (state) => {
      return { ...initialState }
    },
  },
})

export const { setDialog, cancelDialog } = dialogSlice.actions
export const dialogSelector = (state: RootState) => state.dialog
export default dialogSlice.reducer
