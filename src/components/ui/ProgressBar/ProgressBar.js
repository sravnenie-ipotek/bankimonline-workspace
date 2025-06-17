import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { Fragment } from 'react';
import { CheckIcon } from '@assets/icons/CheckIcon';
import { useAppSelector } from '@src/hooks/store';
import styles from './progressBar.module.scss';
const cx = classNames.bind(styles);
const ProgressBar = ({ progress, data }) => {
    const windowSize = useAppSelector((state) => state.windowSize.width);
    return (_jsx("div", { className: cx('progress'), children: _jsx("div", { className: cx('wrapper'), children: data?.map((item, index) => (_jsxs(Fragment, { children: [_jsx("div", { className: cx('progress-item'), children: _jsxs("div", { className: cx('progress-item__wrapper'), children: [_jsx("span", { className: cx('progress-item__number', {
                                        active: Number(progress) === index + 1,
                                        checked: Number(progress) >= index + 2,
                                    }), children: Number(progress) >= index + 2 ? (_jsx(CheckIcon, { color: "#161616" })) : (index + 1) }), _jsx("p", { className: cx('progress-item__text', {
                                        activeText: Number(progress) === index + 1,
                                        checkedText: Number(progress) >= index + 2,
                                    }), children: windowSize <= 1200 ? item.split(' ')[0] : item })] }) }), index < data.length - 1 && (_jsx("hr", { className: cx('progress-item__line', {
                            activeHr: Number(progress) === index + 2,
                            checkedHr: Number(progress) >= index + 2,
                        }) }))] }, index))) }) }));
};
export default ProgressBar;
