import { jsx as _jsx } from "react/jsx-runtime";
import styled from '@emotion/styled';
import Control from './Control.tsx';
const ControlSelect = Control();
const StyledItem = styled.div `
  border-radius: 3px;
  margin: 3px;
  cursor: pointer;
  z-index: 9999999;
  display: flex;
  align-items: center;
  > div {
    display: flex;
    align-items: center;
  }
  height: 53px;

  color: #f2f2f2;
  border-bottom: 1px solid transparent;

  padding-left: 0.9rem;
  input {
    margin-right: 10px;
  }

  :hover {
    background-color: rgb(58, 59, 62);
  }

  div.flag {
    padding-left: 2.8rem;
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 400;
    height: 53px;
  }
`;
const CustomSelect = ({ options, values, onChange, direction, placeholder, name, }) => (_jsx(ControlSelect, { valueField: "value", name: name, searchable: false, className: name, placeholder: placeholder, direction: direction, options: options, onChange: onChange, values: values, itemRenderer: ({ item, methods }) => (_jsx(StyledItem, { onClick: () => {
            onChange(item);
            methods.addItem(item);
        }, children: _jsx("div", { "aria-disabled": item.disabled || undefined, children: _jsx("span", { children: _jsx("div", { className: `flag flag-${item.value}`, children: item.label }) }) }) })) }));
export default CustomSelect;
