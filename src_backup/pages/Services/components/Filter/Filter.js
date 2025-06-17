import { jsx as _jsx } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useTranslation } from 'react-i18next';
import { Column } from '@components/ui/Column';
import { DropdownMenu } from '@components/ui/DropdownMenu';
import { useAppDispatch, useAppSelector } from '@src/hooks/store.ts';
import { setFilter } from '@src/pages/Services/slices/filterSlice.ts';
import styles from './filter.module.scss';
const cx = classNames.bind(styles);
const Filter = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const filter = useAppSelector((state) => state.filter);
    const dispatch = useAppDispatch();
    const data = [
        { value: 'filter_1', label: t('calculate_mortgage_filter_1') },
        { value: 'filter_2', label: t('calculate_mortgage_filter_2') },
        { value: 'filter_3', label: t('calculate_mortgage_filter_3') },
        { value: 'filter_4', label: t('calculate_mortgage_filter_4') },
    ];
    return (_jsx(Column, { children: _jsx(DropdownMenu, { data: data, title: t('calculate_mortgage_filter_title'), placeholder: t('calculate_mortgage_filter_title'), value: filter, onChange: (value) => dispatch(setFilter(value)), className: cx('dropdown'), style: { background: 'transparent !important' } }) }));
};
export default Filter;
