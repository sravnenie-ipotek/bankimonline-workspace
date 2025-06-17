import { jsx as _jsx } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useNavigate } from 'react-router';
import styles from './logo.module.scss';
const cx = classNames.bind(styles);
export default function Logo() {
    const navigate = useNavigate();
    return (_jsx("a", { onClick: () => navigate('/'), children: _jsx("img", { alt: "Bankimonline logo", src: "/static/primary-logo05-1.svg", className: cx(`logo`) }) }));
}
