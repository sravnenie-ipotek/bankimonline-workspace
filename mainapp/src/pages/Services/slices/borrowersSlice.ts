import { createSlice } from '@reduxjs/toolkit'

import { FormTypes, ModalTypes } from '../types/formTypes'

type CalculateMortgageState = FormTypes &
  ModalTypes & {
    otherBorrowers: FormTypes[]
    otherBorrowersPageId: number
  }

export const borrowersSlice = createSlice({
  name: 'borrowers',
  initialState: {
    otherBorrowers: [],
    sourceOfIncomeModal: [],
    additionalIncomeModal: [],
    obligationModal: [],
    otherBorrowersPageId: 0,
  } as unknown as CalculateMortgageState,
  reducers: {
    updateOtherBorrowers: (state, action) => {
      const { id, newFields } = action.payload

      const index = state.otherBorrowers.findIndex((item) => item.id === id)

      if (index !== -1) {
        state.otherBorrowers[index] = {
          ...state.otherBorrowers[index],
          ...newFields,
        }
      } else {
        const newBorrower = {
          id,
          ...newFields,
        }
        state.otherBorrowers.push(newBorrower)
      }
    },
    deleteOtherBorrowers: (state, action) => {
      state.otherBorrowers = state.otherBorrowers.filter(
        (item) => item.id !== action.payload
      )
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
    openBorrowersPage: (state, action) => {
      state.otherBorrowersPageId = action.payload
    },
  },
})

export const {
  updateSourceOfIncomeModal,
  deleteSourceOfIncomeModal,
  updateAdditionalIncomeModal,
  deleteAdditionalIncomeModal,
  updateObligationModal,
  deleteObligationModal,
  updateOtherBorrowers,
  deleteOtherBorrowers,
  openBorrowersPage,
} = borrowersSlice.actions

export default borrowersSlice.reducer
