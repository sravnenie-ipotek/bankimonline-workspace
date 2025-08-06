import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { setCurrency } from '@src/store/slices/currencySlice.ts';
import Select from 'react-dropdown-select';
import styled from '@emotion/styled';

const StyledSelect = styled(Select)`
  align-self: stretch;
  background-color: #161616;
  border: 1px solid rgb(51, 53, 53);
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 4px;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  text-align: center;
  height: 56px;
  min-width: 120px;
  padding: 0 1rem;

  .react-dropdown-select-content,
  .react-dropdown-select-input {
    color: #fff;
    text-align: center;
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

  .react-dropdown-select-item {
    color: #f2f2f2;
    border-bottom: 1px solid transparent;
    padding: 0.9rem 1rem;
    text-align: center;

    &:hover {
      background-color: rgb(58, 59, 62);
    }
  }

  .react-dropdown-select-item-selected {
    background: transparent !important;
    color: #fff;
    font-weight: bold;
  }
`;

const CurrencySelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const currencyState = useAppSelector((state) => state.currency);
  const currency = currencyState?.currency || 'ILS'; // Provide fallback
  const { t } = useTranslation();

  const currencies = [
    { value: 'ILS', label: t('currency_ils', 'ILS (₪)') },
    { value: 'USD', label: t('currency_usd', 'USD ($)') },
    { value: 'EUR', label: t('currency_eur', 'EUR (€)') },
  ];

  const handleChange = (values: any) => {
    if (values.length > 0) {
      dispatch(setCurrency(values[0].value as 'ILS' | 'USD' | 'EUR'));
    }
  };

  return (
    <StyledSelect
      options={currencies}
      values={currencies.filter((c) => c.value === currency)}
      onChange={handleChange}
      labelField="label"
      valueField="value"
      searchable={false}
      clearable={false}
    />
  );
};

export default CurrencySelector; 