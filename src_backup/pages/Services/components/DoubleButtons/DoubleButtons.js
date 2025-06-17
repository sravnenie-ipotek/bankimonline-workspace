import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Button } from '@components/ui/ButtonUI';
import styles from './doubleButtons.module.scss';
const cx = classNames.bind(styles);
const DoubleButtons = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { handleSubmit, isValid } = useFormikContext();
    return (_jsx("div", { className: cx('doubleButtons'), children: _jsx("div", { className: cx('wrapper'), children: _jsxs("div", { className: cx('buttons'), children: [_jsx(Button, { variant: "modalBase", type: "submit", onClick: () => navigate(-1), size: "full", children: t('button_back') }), _jsx(Button, { type: "submit", isDisabled: !isValid, onClick: handleSubmit, size: "full", children: t('button_next_save') })] }) }) }));
};
export default DoubleButtons;
