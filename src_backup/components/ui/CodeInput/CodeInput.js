import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import OtpInput from 'react-otp-input';
import styles from './CodeInput.module.scss';
export function CodeInput({ otpValue, setOtpValue, error }) {
    return (_jsxs(_Fragment, { children: [_jsx(OtpInput, { onChange: setOtpValue, containerStyle: styles.wrapper, value: otpValue, inputType: "tel", numInputs: 4, renderInput: (props) => (_jsx("input", { ...props, className: styles.itemCode })) }), error && !!error.length && _jsx("div", { className: styles.error, children: error })] }));
}
