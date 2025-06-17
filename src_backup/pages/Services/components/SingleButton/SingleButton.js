import { jsx as _jsx } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Button } from '@components/ui/ButtonUI';
import styles from './singleButton.module.scss';
const cx = classNames.bind(styles);
const SingleButton = () => {
    const { t } = useTranslation();
    const { isValid, handleSubmit } = useFormikContext();
    return (_jsx("div", { className: cx('submit-btn'), children: _jsx("div", { className: cx('wrapper'), children: _jsx("div", { className: cx('buttons'), children: _jsx(Button, { isDisabled: !isValid, onClick: handleSubmit, size: "smallLong", type: "button", children: t('button_next') }) }) }) }));
};
export default SingleButton;
