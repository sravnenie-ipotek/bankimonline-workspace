import Select from 'react-dropdown-select'

import styled from '@emotion/styled'

// Компонент выбора языка
export default function Control() {
  return styled(Select)`
    align-self: stretch;
    background-color: #161616;
    border: 1px solid rgb(51, 53, 53);
    display: flex;
    flex-direction: row;
    //padding: 0.75rem 1.5rem;
    align-items: center;
    border-radius: 4px;
    justify-content: space-between;
    color: #fff;
    font-size: 18px;
    text-align: right;
    height: 56px;
    appearance: none;
    padding-right: 1rem;
    // min-width:20.213rem;
    min-width: 14.375rem;
    width: 100%;

    :focus-within {
      border: 1px solid rgb(51, 53, 53);
    }

    :focus {
      border: 1px solid rgb(51, 53, 53);
    }

    :active {
      border: 1px solid rgb(51, 53, 53);
    }

    :hover {
      border: 1px solid rgb(51, 53, 53);
    }

    .react-dropdown-select-clear,
    .react-dropdown-select-dropdown-handle {
      color: #fff;
      zoom: 1.7;
    }
    //
    //.react-dropdown-select-dropdown-handle {
    //  position: absolute;
    //  left: 0.25rem;
    //}

    .react-dropdown-select-dropdown-handle {
      display: none;
    }

    .react-dropdown-select-option {
    }

    .react-dropdown-select-item {
      color: #333;
    }

    .react-dropdown-select-input {
      color: #fff;
      font-size: 20px;
    }

    .react-dropdown-select-dropdown {
      font-size: 14px;

      position: absolute;
      left: 0;
      border: none;
      padding: 0;
      display: flex;
      flex-direction: column;
      border-radius: 4px;
      max-height: 300px;
      overflow: auto;
      z-index: 9;
      background: #2a2b30;
      box-shadow: none;
      color: #fff !important;
    }

    .react-dropdown-select-no-data {
      color: #f2f2f2;
    }

    .react-dropdown-select-item {
      color: #f2f2f2;
      border-bottom: 1px solid transparent;

      padding-bottom: 0.9rem;
      padding-top: 1rem;

      :hover {
        background-color: rgb(58, 59, 62);
      }
    }

    .react-dropdown-select-item.react-dropdown-select-item-selected,
    .react-dropdown-select-item.react-dropdown-select-item-active {
      //background: #111;
      background: transparent !important;
      border-bottom: 1px solid transparent;
      color: #fff;
      font-weight: bold;
    }

    .react-dropdown-select-item.react-dropdown-select-item-disabled {
      //background: #777;
      //color: #ccc;
    }

    .react-dropdown-select {
      overflow: hidden !important;
    }

    .react-dropdown-select-content {
      height: 22px;
      padding-left: 1rem;
    }

    .react-dropdown-select-content > span {
      display: flex;
      width: 16rem;

      white-space: nowrap;
      overflow: hidden;
    }
  `
}
