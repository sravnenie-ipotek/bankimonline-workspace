import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classnames from 'classnames/bind';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Message } from '../../Message';
import styles from './initialFeeContext.module.scss';
const cx = classnames.bind(styles);
// Компонент  кнопки под полем ввода дс текстом первоначального взноса
const InitialFeeContext = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const { values } = useFormikContext();
    const formattedValue = values.initialFee.toLocaleString('en-US');
    const percentFinanced = Math.trunc((values.initialFee / values.priceOfEstate) * 100);
    return (_jsxs(Message, { style: { marginTop: '2px' }, children: [_jsx("span", { className: cx('margin-sides'), children: t('calc_mortrage_subtext_1') }), _jsxs("b", { className: cx('bold-text'), children: [formattedValue, " \u20AA"] }), _jsx("br", {}), _jsx("span", { className: cx('margin-sides'), children: t('calc_mortrage_subtext_3') }), _jsxs("b", { className: cx('bold-text'), children: [percentFinanced === Infinity ? 0 : percentFinanced, " %"] })] }));
};
export default InitialFeeContext;
