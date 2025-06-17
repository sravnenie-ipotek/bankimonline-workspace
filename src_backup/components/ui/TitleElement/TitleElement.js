import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useRef, useState } from 'react';
import { InfoIcon } from '../../../assets/icons/InfoIcon';
import styles from './titleElement.module.scss';
const cx = classNames.bind(styles);
const TitleElement = ({ title, tooltip }) => {
    const [isTooltipVisible, setTooltipVisible] = useState(false);
    const timer = useRef(null);
    const handleOver = () => {
        if (timer.current) {
            clearTimeout(timer.current);
        }
        setTooltipVisible(true);
    };
    const handleOut = () => {
        timer.current = setTimeout(() => {
            setTooltipVisible(false);
        }, 200);
    };
    return (_jsx(_Fragment, { children: _jsxs("div", { className: cx('title'), children: [_jsx("span", { className: cx('title-text'), children: title }), tooltip && (_jsxs(_Fragment, { children: [_jsx(InfoIcon, { className: cx('tooltip-icon'), onMouseEnter: handleOver, onMouseLeave: handleOut, size: 20 }), isTooltipVisible && (_jsx("div", { onMouseEnter: handleOver, onMouseLeave: handleOut, className: cx('tt', 'scrollbar scrollbar-thumb-base-secondaryHoveredButton scrollbar-thumb-rounded-md scrollbar-w-1'), children: tooltip }))] }))] }) }));
};
export default TitleElement;
