import { jsx as _jsx } from "react/jsx-runtime";
import cn from 'classnames';
import styles from './Button.module.scss';
export function Button({ children, variant, disabled, ...props }) {
    return (_jsx("button", { disabled: disabled, ...props, className: cn(styles.button, {
            primary: [styles.primary],
            secondary: [styles.secondary],
            disabled: [styles.disabled],
        }[disabled ? 'disabled' : variant]), children: children }));
}
