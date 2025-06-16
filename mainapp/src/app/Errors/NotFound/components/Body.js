import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import '../NotFound.module.scss';
import styles from '../NotFound.module.scss';
import Button from './Button.tsx';
import Greeting from './Greeting.tsx';
import Stripe from './Stripe.tsx';
const cx = classNames.bind(styles);
const Body = ({ type }) => {
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: cx(`notfound-body`), children: _jsxs("div", { className: cx(`notfound-actions`), children: [_jsx(Greeting, { type: type }), _jsx(Button, {})] }) }), _jsx(Stripe, {})] }));
};
export default Body;
