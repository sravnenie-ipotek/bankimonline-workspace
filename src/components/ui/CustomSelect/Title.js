import { jsx as _jsx } from "react/jsx-runtime";
import TitleElement from '../TitleElement/TitleElement.tsx';
// Компонент подписи к выпадающему списку
const Title = (props) => {
    return (_jsx("div", { className: 'custom-select-title', children: _jsx(TitleElement, { title: props.title }) }));
};
export default Title;
