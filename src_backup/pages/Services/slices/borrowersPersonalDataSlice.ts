import { createSlice } from '@reduxjs/toolkit'

import { FormTypes, ModalTypes } from '../types/formTypes'

type CalculateMortgageState = FormTypes &
  ModalTypes & {
    borrowersPersonalData: FormTypes
  }

export const borrowersPersonalDataSlice = createSlice({
  name: 'borrowersPersonalData',
  initialState: {
    borrowersPersonalData: {},
    sourceOfIncomeModal: [],
    additionalIncomeModal: [],
    obligationModal: [],
  } as unknown as CalculateMortgageState,
  reducers: {
    updateBorrowersPersonalData: (state, action) => {
      const newBorrowerValues = { ...action.payload }

      if (newBorrowerValues.additionalIncome === 'no') {
        delete newBorrowerValues.additionalIncomeAmount
      }

      if (newBorrowerValues.obligation === 'no') {
        delete newBorrowerValues.bank
        delete newBorrowerValues.monthlyPaymentForAnotherBank
        delete newBorrowerValues.endDate
      }

      state.borrowersPersonalData = {
        ...state.borrowersPersonalData,
        ...newBorrowerValues,
      }
    },
    deleteBorrowersPersonalData: (state) => {
      state.borrowersPersonalData = {} as unknown as FormTypes
    },
    updateSourceOfIncomeModal: (state, action) => {
      const index = state.sourceOfIncomeModal.findIndex(
        (item) => item.id === action.payload.id
      )

      if (index !== -1) {
        state.sourceOfIncomeModal[index] = action.payload
      } else {
        state.sourceOfIncomeModal = [
          ...state.sourceOfIncomeModal,
          action.payload,
        ]
      }
    },
    deleteSourceOfIncomeModal: (state, action) => {
      state.sourceOfIncomeModal = state.sourceOfIncomeModal.filter(
        (item) => item.id !== action.payload.id
      )
    },
    updateAdditionalIncomeModal: (state, action) => {
      const index = state.additionalIncomeModal.findIndex(
        (item) => item.id === action.payload.id
      )

      if (index !== -1) {
        state.additionalIncomeModal[index] = action.payload
      } else {
        state.additionalIncomeModal = [
          ...state.additionalIncomeModal,
          action.payload,
        ]
      }
    },
    deleteAdditionalIncomeModal: (state, action) => {
      state.additionalIncomeModal = state.additionalIncomeModal.filter(
        (item) => item.id !== action.payload.id
      )
    },
    updateObligationModal: (state, action) => {
      const index = state.obligationModal.findIndex(
        (item) => item.id === action.payload.id
      )

      if (index !== -1) {
        state.obligationModal[index] = action.payload
      } else {
        state.obligationModal = [...state.obligationModal, action.payload]
      }
    },
    deleteObligationModal: (state, action) => {
      state.obligationModal = state.obligationModal.filter(
        (item) => item.id !== action.payload.id
      )
    },
  },
})

export const {
  updateBorrowersPersonalData,
  updateSourceOfIncomeModal,
  deleteSourceOfIncomeModal,
  updateAdditionalIncomeModal,
  deleteAdditionalIncomeModal,
  updateObligationModal,
  deleteObligationModal,
  deleteBorrowersPersonalData,
} = borrowersPersonalDataSlice.actions

export default borrowersPersonalDataSlice.reducer
