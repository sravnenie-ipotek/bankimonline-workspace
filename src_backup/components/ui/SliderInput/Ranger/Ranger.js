import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { Handles, Rail, Slider, Tracks } from 'react-compound-slider';
import { useTranslation } from 'react-i18next';
import Track from '@components/ui/SliderInput/Ranger/Track.tsx';
import Handle from './Handle.tsx';
import styles from './Ranger.module.scss';
const cx = classNames.bind(styles);
const Ranger = ({ min, max, step, values, onUpdate, onChange, }) => {
    const { i18n } = useTranslation();
    return (_jsxs(Slider, { mode: 1, step: step, domain: [min, max], onUpdate: onUpdate, onChange: onChange, values: values, reversed: i18n.language === 'he', className: cx('slider'), children: [_jsx(Rail, { children: ({ getRailProps }) => (_jsx("div", { className: cx('rail', 'bg-base-secondaryDefaultButton'), ...getRailProps() })) }), _jsx(Handles, { children: ({ handles, getHandleProps }) => (_jsx("div", { className: "slider-handles", children: handles.map((handle) => (_jsx(Handle, { handle: handle, domain: [min, max], getHandleProps: getHandleProps }, handle.id))) })) }), _jsx(Tracks, { left: i18n.language !== 'he', right: i18n.language === 'he', children: ({ tracks, getTrackProps }) => (_jsx("div", { className: "slider-tracks", children: tracks.map(({ id, source, target }) => (_jsx(Track, { source: source, target: target, getTrackProps: getTrackProps }, id))) })) })] }));
};
export default Ranger;
