import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useState } from 'react';
import styles from './tab.module.scss';
const cx = classNames.bind(styles);
const Tab = ({ data }) => {
    const [nowView, setNowView] = useState(0);
    if (data.titles.length !== data.content.length)
        return _jsx("p", { children: "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043A\u043E\u0432 \u0438 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0433\u043E \u043D\u0435 \u0441\u043E\u0432\u043F\u0430\u0434\u0430\u0435\u0442" });
    return (_jsx("div", { className: cx(styles.tabPlaya), children: _jsxs("div", { className: cx(styles.tabPlate), children: [_jsx("div", { className: cx(styles.tabTitles), children: data.titles.map((title, index) => (_jsx("p", { className: cx(index === nowView ? styles.tabTitleActive : styles.tabTitle), onClick: () => setNowView(index), children: title }, index))) }), _jsx("div", { className: cx(styles.tabsContent), children: data.content[nowView] })] }) }));
};
export default Tab;
