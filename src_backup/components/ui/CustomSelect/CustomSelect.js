import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import Control from './Control.tsx';
import Title from './Title.tsx';
export default function CustomSelect({ name, values, title, placeholder, direction, options, onChange, }) {
    const ControlSelect = Control({ name });
    if (typeof values !== 'undefined' && values && values[0] !== '') {
        return (_jsxs(_Fragment, { children: [typeof title !== 'undefined' ? _jsx(Title, { title: title }) : _jsx(_Fragment, {}), _jsx(ControlSelect, { valueField: "value", name: name, searchable: false, className: name, placeholder: placeholder, direction: direction, options: options, onChange: onChange, values: values })] }));
    }
    return (_jsxs(_Fragment, { children: [typeof title !== 'undefined' ? _jsx(Title, { title: title }) : _jsx(_Fragment, {}), _jsx(ControlSelect, { values: values, valueField: "value", name: name, searchable: false, className: name, placeholder: placeholder, direction: direction, options: options, onChange: onChange })] }));
}
