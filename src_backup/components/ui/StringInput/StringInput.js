import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { TitleElement } from '../TitleElement';
import Control from './Control/Control';
export default function StringInput({ title, error, placeholder, onChange, value, onBlur, name, }) {
    return (_jsxs(_Fragment, { children: [_jsx(TitleElement, { title: title }), _jsx(Control, { error: error, placeholder: placeholder, value: value, onChange: onChange, onBlur: onBlur, name: name })] }));
}
