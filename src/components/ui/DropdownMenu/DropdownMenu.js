import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import TitleElement from '../TitleElement/TitleElement';
import { Dropdown } from './Dropdown';
const DropdownMenu = ({ data, title, placeholder, onChange, value, searchable, searchPlaceholder, nothingFoundText, onBlur, error, className, }) => {
    return (_jsxs(_Fragment, { children: [title && _jsx(TitleElement, { title: title }), _jsx(Dropdown, { data: data, placeholder: placeholder, onChange: onChange, value: value, searchable: searchable, searchPlaceholder: searchPlaceholder, nothingFoundText: nothingFoundText, onBlur: onBlur, error: error, className: className })] }));
};
export default DropdownMenu;
