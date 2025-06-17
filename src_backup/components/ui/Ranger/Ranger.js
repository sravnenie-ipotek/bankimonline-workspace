import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Handles, Rail, Slider, Tracks } from 'react-compound-slider';
// Эти компоненты можно создать или настроить в соответствии с вашими требованиями
import Track from '@components/ui/Ranger/Track.tsx';
import Handle from './Handle.tsx';
const sliderStyle = {
    position: 'relative',
    width: '100%',
};
const Ranger = ({ min, max, step, values, onChange, }) => {
    return (_jsxs(Slider, { mode: 2, step: step, domain: [min, max], rootStyle: sliderStyle, onUpdate: onChange, values: values, children: [_jsx(Rail, { children: ({ getRailProps }) => (_jsx("div", { style: {
                        position: 'absolute',
                        width: '100%',
                        height: 8,
                        borderRadius: 4,
                        cursor: 'pointer',
                        backgroundColor: 'gray',
                    }, ...getRailProps() })) }), _jsx(Handles, { children: ({ handles, getHandleProps }) => (_jsx("div", { className: "slider-handles", children: handles.map((handle) => (_jsx(Handle, { handle: handle, domain: [min, max], getHandleProps: getHandleProps }, handle.id))) })) }), _jsx(Tracks, { left: false, right: false, children: ({ tracks, getTrackProps }) => (_jsx("div", { className: "slider-tracks", children: tracks.map(({ id, source, target }) => (_jsx(Track, { source: source, target: target, getTrackProps: getTrackProps }, id))) })) })] }));
};
export default Ranger;
