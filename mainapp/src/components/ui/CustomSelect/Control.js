import Select from 'react-dropdown-select';
import { useTranslation } from 'react-i18next';
import styled from '@emotion/styled';
// компонент выпадающего списка
const Control = (p) => {
    const { i18n } = useTranslation();
    i18n.language = i18n.language?.split('-')[0];
    return styled(Select) `
    align-self: stretch;
    background-color: #2a2b31;
    border: 1px solid rgb(51, 53, 53);
    display: flex;
    flex-direction: row;
    //padding: 0.75rem 1.5rem;
    align-items: center;
    border-radius: 6px;
    justify-content: space-between;
    color: #fff;
    font-size: 18px;
    text-align: right;
    height: 3rem;
    appearance: none;
    padding-right: 1rem;
    // min-width:20.213rem;
    min-width: 20.313rem;
    width: 100%;
    position: relative;
    left: 1px;

    :focus-within {
      border: 1px solid #fbe54d;
    }

    :focus {
      border: 1px solid #fbe54d;
    }

    :active {
      border: 1px solid #fbe54d;
    }

    :hover {
      border: 1px solid #fbe54d;
    }

    .react-dropdown-select-clear,
    .react-dropdown-select-dropdown-handle {
      color: #fff;
      zoom: 1.7;
    }

    .react-dropdown-select-dropdown-handle {
      overflow: hidden;
    }

    //.react-dropdown-select-dropdown-handle {
    //  position: absolute;
    //  left: 0.25rem;
    //}

    .react-dropdown-select-option {
    }

    .react-dropdown-select-item {
      color: #333;
      display: flex;
      padding-left: 1rem;
      padding-right: 1rem;
      text-align: left;
    }

    .react-dropdown-select-input {
      color: #fff;
      font-size: 16px;
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
      background-color: transparent !important;
      border-bottom: 1px solid transparent;
      color: #fff;
      font-weight: bold;
    }

    span.react-dropdown-select-item.react-dropdown-select-item-selected {
      background-image: url(/g.svg) !important;
      background-repeat: no-repeat !important;
      display: flex;
      align-items: center;
      background-position: left;
      background-position-x: right;
      margin-right: 1rem;
    }

    //
    //span.react-dropdown-select-item.react-dropdown-select-item-selected{
    //  background-image: url(/static/g.svg)!important;
    //  background-repeat: no-repeat!important;
    //  display: flex;
    //  align-items: center;
    //  background-position: right;
    //  background-position-x: 1rem;
    //}

    .react-dropdown-select-item.react-dropdown-select-item-disabled {
      //background: #777;
      //color: #ccc;
    }

    div.react-dropdown-select {
      overflow: hidden !important;
      height: 3.25rem !important;
    }

    .react-dropdown-select-content {
      position: relative;
      left: 0.5rem;
    }

    .react-dropdown-select-content > span {
      display: flex;
      width: 16rem;
      white-space: nowrap;
      overflow: hidden;

      align-items: center;
      justify-content: flex-start;
    }

    .css-hdxxmg-ReactDropdownSelect .react-dropdown-select-content > span {
      font-size: 1rem;
    }
  `;
};
export default Control;
