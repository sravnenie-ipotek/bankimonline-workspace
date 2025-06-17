import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useRef, useState } from 'react';
import { InfoIcon } from '../../../assets/icons/InfoIcon';
import styles from './tooltip.module.scss';
const cx = classNames.bind(styles);
const Tooltip = ({ tooltip }) => {
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
    return (_jsxs("div", { className: cx('tooltip'), children: [_jsx(InfoIcon, { onMouseEnter: handleOver, onMouseLeave: handleOut }), isTooltipVisible && (_jsx("p", { onMouseEnter: handleOver, onMouseLeave: handleOut, children: tooltip }))] }));
};
export default Tooltip;
