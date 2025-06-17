import { createSlice } from '@reduxjs/toolkit'

type ModalState = {
  isOpenSourceOfIncome: boolean
  isOpenAdditionalIncome: boolean
  isOpenObligation: boolean
  isOpenLogin: boolean
  isOpenAuth: boolean
  currentId: number
}

export const modalSlice = createSlice({
  name: 'modal',
  initialState: {
    isOpenSourceOfIncome: false,
    isOpenAdditionalIncome: false,
    isOpenObligation: false,
    isOpenLogin: false,
    isOpenAuth: false,
    currentId: 0,
  } as ModalState,
  reducers: {
    createSourceOfIncomeModal: (state) => {
      state.isOpenSourceOfIncome = true
    },
    createAdditionalIncomeModal: (state) => {
      state.isOpenAdditionalIncome = true
    },
    createObligationModal: (state) => {
      state.isOpenObligation = true
    },
    openLoginModal: (state) => {
      state.isOpenLogin = true
    },
    openAuthModal: (state) => {
      state.isOpenAuth = true
    },
    openSourceOfIncomeModal: (state, action) => {
      state.isOpenSourceOfIncome = true
      state.currentId = action.payload
    },
    openAdditionalIncomeModal: (state, action) => {
      state.isOpenAdditionalIncome = true
      state.currentId = action.payload
    },
    openObligationModal: (state, action) => {
      state.isOpenObligation = true
      state.currentId = action.payload
    },
    closeModal: (state) => {
      state.isOpenSourceOfIncome = false
      state.isOpenAdditionalIncome = false
      state.isOpenObligation = false
      state.isOpenLogin = false
      state.isOpenAuth = false
      state.currentId = 0
    },
    setCurrentId: (state, action) => {
      state.currentId = action.payload
    },
  },
})

export const {
  closeModal,
  setCurrentId,
  createSourceOfIncomeModal,
  createAdditionalIncomeModal,
  createObligationModal,
  openLoginModal,
  openAuthModal,
  openSourceOfIncomeModal,
  openAdditionalIncomeModal,
  openObligationModal,
} = modalSlice.actions
export default modalSlice.reducer
