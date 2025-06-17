import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { Logo } from '@assets/icons/Logo.tsx';
import Spinner from './Spinner.tsx';
import styles from './loader.module.scss';
const cx = classNames.bind(styles);
const Loader = () => {
    return (_jsxs("div", { className: cx(`w-full min-h-screen flex flex-col justify-center items-center bg-base-primary`), children: [_jsx(Logo, { size: 102 }), _jsx(Spinner, {})] }));
};
export default Loader;
