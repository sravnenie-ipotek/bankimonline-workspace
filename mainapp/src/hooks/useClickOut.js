import { useCallback, useEffect, useRef } from 'react';
export const useClickOut = ({ handleClickOut }) => {
    const ref = useRef(null);
    const handleClick = useCallback((event) => {
        if (ref.current &&
            !ref.current.contains(event.target) &&
            handleClickOut) {
            handleClickOut();
        }
    }, [handleClickOut]);
    useEffect(() => {
        document.addEventListener('mousedown', handleClick);
        return () => {
            document.removeEventListener('mousedown', handleClick);
        };
    }, [handleClick, handleClickOut]);
    return ref;
};
