import React, { CSSProperties } from 'react'

import styled from '@emotion/styled'

import Control from './Control.tsx'

const ControlSelect = Control()

const StyledItem = styled.div`
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
`

interface Option {
  value: string
  label?: string
  disabled?: boolean
}

interface ItemRendererProps {
  item: Option
  methods: {
    addItem: (item: Option) => void
  }
}
interface CustomSelectProps {
  options: Option[]
  values: Option[]
  onChange: (item: any) => void
  direction?: 'rtl' | 'ltr'
  placeholder?: string
  name: string
  itemRenderer?: (props: ItemRendererProps) => React.ReactNode
  style?: CSSProperties
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  values,
  onChange,
  direction,
  placeholder,
  name,
}) => (
  <ControlSelect
    valueField="value"
    name={name}
    searchable={false}
    className={name}
    placeholder={placeholder}
    direction={direction}
    options={options}
    onChange={onChange}
    values={values}
    itemRenderer={({ item, methods }: any) => (
      <StyledItem
        onClick={() => {
          onChange(item)
          methods.addItem(item)
        }}
      >
        <div aria-disabled={item.disabled || undefined}>
          <span>
            <div className={`flag flag-${item.value}`}>{item.label}</div>
          </span>
        </div>
      </StyledItem>
    )}
  />
)

export default CustomSelect
