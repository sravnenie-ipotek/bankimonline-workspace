import { jsx as _jsx } from "react/jsx-runtime";
const Handle = ({ handle: { id, value, percent }, getHandleProps, }) => {
    return (_jsx("div", { style: {
            left: `${percent}%`,
            position: 'absolute',
            marginLeft: '-15px',
            marginTop: '-6px',
            zIndex: 2,
            width: 30,
            height: 16,
            border: 0,
            textAlign: 'center',
            cursor: 'pointer',
            borderRadius: '50%',
            backgroundColor: '#2C3E50',
            color: '#fff',
        }, ...getHandleProps(id), children: _jsx("div", { style: { fontSize: '11px', marginTop: '1px' }, children: value }) }));
};
export default Handle;
