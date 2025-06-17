import { jsx as _jsx } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useTranslation } from 'react-i18next';
import styles from './Ranger.module.scss';
const cx = classNames.bind(styles);
const Handle = ({ handle: { id, percent }, getHandleProps, }) => {
    const { i18n } = useTranslation();
    return (_jsx("div", { className: cx('handle', 'bg-accent-primary'), style: {
            left: `${percent}%`,
            marginLeft: `${i18n.language === 'he' && '-12px'}`,
        }, ...getHandleProps(id) }));
};
export default Handle;
