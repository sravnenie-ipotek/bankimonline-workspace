import { createSlice } from '@reduxjs/toolkit'

import { FormTypes, ModalTypes } from '../types/formTypes'

type OtherBorrowers = FormTypes &
  ModalTypes & {
    id: number
    otherBorrowersPageId: number
  }

export const otherBorrowersSlice = createSlice({
  name: 'otherBorrowers',
  initialState: {
    otherBorrowers: [] as OtherBorrowers[],
    otherBorrowersPageId: 0,
  },
  reducers: {
    updateOtherBorrowers: (state, action) => {
      const { id, newFields } = action.payload

      const index = state.otherBorrowers.findIndex((item) => item.id === id)

      const additionalIncomeModal =
        state.otherBorrowers[index]?.additionalIncomeModal
      const obligationModal = state.otherBorrowers[index]?.obligationModal
      const sourceOfIncomeModal =
        state.otherBorrowers[index]?.sourceOfIncomeModal

      if (index !== -1) {
        state.otherBorrowers[index] = {
          ...state.otherBorrowers[index],
          ...newFields,
          additionalIncomeModal,
          obligationModal,
          sourceOfIncomeModal,
        }
      } else {
        const newBorrower = {
          id,
          ...newFields,
          additionalIncomeModal: [],
          obligationModal: [],
          sourceOfIncomeModal: [],
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
      const { pageId, id } = action.payload

      const index = state.otherBorrowers[
        pageId - 1
      ].sourceOfIncomeModal.findIndex((item) => item.id === id)

      if (index !== -1) {
        state.otherBorrowers[pageId - 1].sourceOfIncomeModal[index] =
          action.payload
      } else {
        state.otherBorrowers[pageId - 1].sourceOfIncomeModal = [
          ...state.otherBorrowers[pageId - 1].sourceOfIncomeModal,
          action.payload,
        ]
      }
    },
    deleteSourceOfIncomeModal: (state, action) => {
      state.otherBorrowers[action.payload.pageId - 1].sourceOfIncomeModal =
        state.otherBorrowers[
          action.payload.pageId - 1
        ].sourceOfIncomeModal.filter((item) => item.id !== action.payload.id)
    },
    updateAdditionalIncomeModal: (state, action) => {
      const { pageId, id } = action.payload

      const index = state.otherBorrowers[
        pageId - 1
      ].additionalIncomeModal.findIndex((item) => item.id === id)

      if (index !== -1) {
        state.otherBorrowers[pageId - 1].additionalIncomeModal[index] =
          action.payload
      } else {
        state.otherBorrowers[pageId - 1].additionalIncomeModal = [
          ...state.otherBorrowers[pageId - 1].additionalIncomeModal,
          action.payload,
        ]
      }
    },
    deleteAdditionalIncomeModal: (state, action) => {
      const { pageId, id } = action.payload

      state.otherBorrowers[pageId - 1].additionalIncomeModal =
        state.otherBorrowers[pageId - 1].additionalIncomeModal.filter(
          (item) => item.id !== id
        )
    },
    updateObligationModal: (state, action) => {
      const { pageId, id } = action.payload

      const index = state.otherBorrowers[pageId - 1].obligationModal.findIndex(
        (item) => item.id === id
      )

      if (index !== -1) {
        state.otherBorrowers[pageId - 1].obligationModal[index] = action.payload
      } else {
        state.otherBorrowers[pageId - 1].obligationModal = [
          ...state.otherBorrowers[pageId - 1].obligationModal,
          action.payload,
        ]
      }
    },
    deleteObligationModal: (state, action) => {
      const { pageId, id } = action.payload

      state.otherBorrowers[pageId - 1].obligationModal = state.otherBorrowers[
        pageId - 1
      ].obligationModal.filter((item) => item.id !== id)
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
} = otherBorrowersSlice.actions

export default otherBorrowersSlice.reducer
