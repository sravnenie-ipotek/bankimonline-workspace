import { jsx as _jsx } from "react/jsx-runtime";
const Track = ({ source, target, getTrackProps }) => {
    return (_jsx("div", { style: {
            position: 'absolute',
            height: 8,
            zIndex: 1,
            backgroundColor: 'red',
            borderRadius: 4,
            cursor: 'pointer',
            left: `${source.percent}%`,
            width: `${target.percent - source.percent}%`,
        }, ...getTrackProps() }));
};
export default Track;
