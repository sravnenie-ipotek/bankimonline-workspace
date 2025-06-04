import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface SettingsUserState {
  name: string
  phone: string
  email: string
  password: string
  iconPath?: string
  tempPhone?: string
  tempEmail?: string
}

const initialState: SettingsUserState = {
  name: 'Александр Пушкин',
  phone: '+ 935 55 324 3223',
  email: 'Bankimonline@mail.com',
  password: '555',
  iconPath: '',
  tempPhone: '',
  tempEmail: '',
}

const settingsUserSlice = createSlice({
  name: 'settingsUser',
  initialState,
  reducers: {
    changeName: (state, action: PayloadAction<string>) => {
      state.name = action.payload
    },

    changePhone: (state, action: PayloadAction<string>) => {
      state.phone = action.payload
    },
    changeEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload
    },
    changePassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload
    },
  },
})

export const { changeName, changePhone, changeEmail, changePassword } =
  settingsUserSlice.actions
export default settingsUserSlice.reducer
