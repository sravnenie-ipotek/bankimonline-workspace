import { jsx as _jsx } from "react/jsx-runtime";
import cn from 'classnames';
import styles from './Tabs.module.scss';
export function Tabs({ handleChange, tab, tabs }) {
    return (_jsx("div", { className: styles.tabs, children: tabs.map(({ value, label }, index) => (_jsx("div", { onClick: () => handleChange(value), className: cn(styles.itemTab, {
                [styles.active]: tab === value,
            }), children: label }, `${value}_${index}`))) }));
}
