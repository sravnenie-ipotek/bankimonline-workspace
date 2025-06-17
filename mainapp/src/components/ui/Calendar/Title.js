import { jsx as _jsx } from "react/jsx-runtime";
// Компонент подписи к календарю
const Title = (props) => {
    return (_jsx("div", { className: 'custom-select-title', children: _jsx("div", { style: {
                alignSelf: 'stretch',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '0.38rem',
            }, children: _jsx("div", { style: {
                    position: 'relative',
                    lineHeight: '140%',
                    fontWeight: '500',
                }, children: props.title }) }) }));
};
export default Title;
