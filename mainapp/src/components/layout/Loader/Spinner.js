import { jsx as _jsx } from "react/jsx-runtime";
import styles from './loader.module.scss';
const Spinner = () => {
    const totalBars = 8;
    return (_jsx("div", { className: styles.spinner, children: Array.from({ length: totalBars }).map((_, index) => (_jsx("div", { className: styles['bar' + (index + 1)] }, index))) }));
};
export default Spinner;
