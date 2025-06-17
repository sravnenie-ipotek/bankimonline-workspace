import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ErrorIcon } from '@assets/icons/ErrorIcon';
import styles from './ErrorBlock.module.scss';
export function ErrorBlock({ error }) {
    return (_jsx(_Fragment, { children: error && (_jsx("div", { className: styles.wrapper, children: (() => {
                switch (true) {
                    case typeof error === 'string':
                        return (
                        //TODO: change className
                        _jsxs("div", { className: styles.wrapper, children: [_jsx(ErrorIcon, { size: 16, color: "white" }), _jsx("span", { children: error })] }));
                    case Array.isArray(error) && !!error?.length:
                        return (_jsx("ul", { className: styles.list, children: error.map((item, index) => (_jsx("li", { className: styles.item, children: item }, `${item}_${index}`))) }));
                    default:
                        return null;
                }
            })() })) }));
}
