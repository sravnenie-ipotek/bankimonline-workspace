import { jsx as _jsx } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import styles from './Ranger.module.scss';
const cx = classNames.bind(styles);
const Track = ({ source, target, getTrackProps }) => {
    return (_jsx("div", { className: cx('track', 'bg-accent-primary'), style: {
            width: `${target.percent - source.percent}%`,
        }, ...getTrackProps() }));
};
export default Track;
