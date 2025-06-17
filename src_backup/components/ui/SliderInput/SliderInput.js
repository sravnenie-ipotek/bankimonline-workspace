import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { memo, useLayoutEffect, useState } from 'react';
import FormattedInput from '../FormattedInput/FormattedInput.tsx';
import Ranger from './Ranger/Ranger.tsx';
import styles from './SliderInput.module.scss';
const cx = classNames.bind(styles);
const SliderInput = ({ value, max, min, name, error, title, handleChange, disableRangeValues, tooltip, disableCurrency, unitsMax, unitsMin, }) => {
    const [localValue, setLocalValue] = useState(value);
    const handleSliderChange = (value) => {
        setLocalValue(value[0]);
    };
    const handleSliderChangeComplete = (value) => {
        handleChange(value[0]);
    };
    const handleInputChange = (value) => {
        handleChange(value);
    };
    useLayoutEffect(() => {
        setLocalValue(value);
    }, [value]);
    return (_jsx(_Fragment, { children: _jsxs("div", { className: cx('slider-input'), children: [_jsx(FormattedInput, { disableCurrency: disableCurrency, title: title, tooltip: tooltip, name: name, error: error, value: localValue, handleChange: handleInputChange }), _jsx(Ranger, { min: 0, max: max, step: 1, values: [value], onUpdate: handleSliderChange, onChange: handleSliderChangeComplete }), !disableRangeValues && (_jsxs("div", { className: cx('range-ranges'), children: [_jsx("div", { children: _jsxs("span", { className: name + 'Min', children: [min.toLocaleString('en-US'), " ", unitsMin && unitsMin] }) }), _jsx("div", { children: _jsxs("span", { className: name + 'Max', children: [max.toLocaleString('en-US'), " ", unitsMax && unitsMax] }) })] }))] }) }));
};
export default memo(SliderInput);
