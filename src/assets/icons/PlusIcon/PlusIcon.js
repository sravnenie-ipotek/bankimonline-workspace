import { jsx as _jsx } from "react/jsx-runtime";
const PlusIcon = ({ color, ...props }) => {
    return (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: 24, height: 24, fill: "none", ...props, children: _jsx("path", { fill: color, d: "M21 12a.75.75 0 0 1-.75.75h-7.5v7.5a.75.75 0 1 1-1.5 0v-7.5h-7.5a.75.75 0 1 1 0-1.5h7.5v-7.5a.75.75 0 1 1 1.5 0v7.5h7.5A.75.75 0 0 1 21 12Z" }) }));
};
export default PlusIcon;
