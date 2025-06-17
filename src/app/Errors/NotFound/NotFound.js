import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import './NotFound.module.scss';
import Body from './components/Body.tsx';
// Компонент ненайденной страницы
const NotFound = ({ type }) => {
    return (_jsx(_Fragment, { children: _jsx(Body, { type: type }) }));
};
export default NotFound;
